import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CONTRACT_NUMBER_PREFIX,
  CONTRACT_NUMBER_SEQUENCE,
} from '../../../common/constants/contract.constants';
import { translate } from '../../../common/utils/i18n.util';
import { ContractStatus, ContractType, Prisma } from '../../../infra/prisma/prisma-client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  ContractItemInputType,
  ContractItemUpsertType,
  UpdateContractItemDtoType,
} from '../dto/contract-item.dto';

type TransactionClient = Prisma.TransactionClient;

interface CreateContractData {
  clientId: string;
  type: ContractType;
  dueDate: Date;
  number: string;
  items: ContractItemInputType[];
}

interface FindManyFilters {
  status?: ContractStatus;
  type?: ContractType;
  search?: string;
  page: number;
  limit: number;
}

const CONTRACT_INCLUDE = { client: true, items: true } as const;

@Injectable()
export class ContractRepository {
  constructor(private prisma: PrismaService) {}

  async generateNumber(): Promise<string> {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ nextval: bigint | number | string }>>(
      `SELECT nextval('${CONTRACT_NUMBER_SEQUENCE}')`,
    );
    const sequenceValue = String(rows[0].nextval);
    return `${CONTRACT_NUMBER_PREFIX}${sequenceValue.padStart(4, '0')}`;
  }

  create(data: CreateContractData) {
    return this.prisma.contract.create({
      data: {
        number: data.number,
        type: data.type,
        dueDate: data.dueDate,
        clientId: data.clientId,
        value: this.sumItems(data.items),
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitValue: item.unitValue,
            subtotal: this.subtotal(item.quantity, item.unitValue),
          })),
        },
      },
      include: CONTRACT_INCLUDE,
    });
  }

  async findMany(filters: FindManyFilters) {
    const { page, limit, status, type, search } = filters;
    const skip = (page - 1) * limit;
    const where: Prisma.ContractWhereInput = {
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { number: { contains: search, mode: 'insensitive' } },
          { client: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: { client: true, items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string) {
    return this.prisma.contract.findUnique({ where: { id }, include: CONTRACT_INCLUDE });
  }

  update(id: string, data: Prisma.ContractUpdateInput) {
    return this.prisma.contract.update({ where: { id }, data, include: CONTRACT_INCLUDE });
  }

  delete(id: string) {
    return this.prisma.contract.delete({ where: { id } });
  }

  approve(id: string) {
    return this.prisma.contract.update({
      where: { id },
      data: { status: ContractStatus.ACTIVE },
      include: CONTRACT_INCLUDE,
    });
  }

  close(id: string) {
    return this.prisma.contract.update({
      where: { id },
      data: { status: ContractStatus.CLOSED, closedAt: new Date() },
      include: CONTRACT_INCLUDE,
    });
  }

  async countByStatus(): Promise<Record<ContractStatus, number>> {
    const groups = await this.prisma.contract.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const summary: Record<ContractStatus, number> = {
      DRAFT: 0,
      ACTIVE: 0,
      EXPIRED: 0,
      CLOSED: 0,
    };
    for (const group of groups) {
      summary[group.status] = group._count.status;
    }
    return summary;
  }

  addItem(contractId: string, item: ContractItemInputType) {
    return this.prisma.$transaction(async (tx) => {
      await tx.contractItem.create({
        data: {
          contractId,
          description: item.description,
          quantity: item.quantity,
          unitValue: item.unitValue,
          subtotal: this.subtotal(item.quantity, item.unitValue),
        },
      });
      return this.recalculateValue(tx, contractId);
    });
  }

  updateItem(contractId: string, itemId: string, data: UpdateContractItemDtoType) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.contractItem.findUnique({ where: { id: itemId } });
      if (!current) {
        throw new NotFoundException(
          translate('contracts.errors.itemNotFound', 'Item não encontrado'),
        );
      }
      const quantity = data.quantity ?? current.quantity.toNumber();
      const unitValue = data.unitValue ?? current.unitValue.toNumber();

      await tx.contractItem.update({
        where: { id: itemId },
        data: {
          description: data.description ?? current.description,
          quantity,
          unitValue,
          subtotal: this.subtotal(quantity, unitValue),
        },
      });
      return this.recalculateValue(tx, contractId);
    });
  }

  deleteItem(contractId: string, itemId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.contractItem.delete({ where: { id: itemId } });
      return this.recalculateValue(tx, contractId);
    });
  }

  // Edição em lote de contrato + itens (usado pelo PATCH /contracts/:id
  // quando `items` é enviado): apaga os itens removidos, atualiza os que
  // vieram com `id` e cria os que vieram sem `id`, tudo numa única transação
  // — evita a janela de inconsistência de fazer isso via N requisições HTTP
  // sequenciais (delete/update/add por item) que o frontend fazia antes.
  updateWithItems(
    id: string,
    contractData: Prisma.ContractUpdateInput,
    items: ContractItemUpsertType[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existingItems = await tx.contractItem.findMany({ where: { contractId: id } });
      const incomingIds = new Set(items.filter((item) => item.id).map((item) => item.id as string));
      const idsToDelete = existingItems
        .map((item) => item.id)
        .filter((existingId) => !incomingIds.has(existingId));

      if (idsToDelete.length > 0) {
        await tx.contractItem.deleteMany({ where: { id: { in: idsToDelete } } });
      }

      for (const item of items) {
        const subtotal = this.subtotal(item.quantity, item.unitValue);
        if (item.id) {
          await tx.contractItem.update({
            where: { id: item.id },
            data: {
              description: item.description,
              quantity: item.quantity,
              unitValue: item.unitValue,
              subtotal,
            },
          });
        } else {
          await tx.contractItem.create({
            data: {
              contractId: id,
              description: item.description,
              quantity: item.quantity,
              unitValue: item.unitValue,
              subtotal,
            },
          });
        }
      }

      await tx.contract.update({ where: { id }, data: contractData });
      return this.recalculateValue(tx, id);
    });
  }

  async expireDue(): Promise<number> {
    const result = await this.prisma.contract.updateMany({
      where: { status: ContractStatus.ACTIVE, dueDate: { lt: new Date() } },
      data: { status: ContractStatus.EXPIRED },
    });
    return result.count;
  }

  private async recalculateValue(tx: TransactionClient, contractId: string) {
    const items = await tx.contractItem.findMany({ where: { contractId } });
    const value = items.reduce((sum, item) => sum.plus(item.subtotal), new Prisma.Decimal(0));
    return tx.contract.update({
      where: { id: contractId },
      data: { value },
      include: CONTRACT_INCLUDE,
    });
  }

  private subtotal(quantity: number, unitValue: number): Prisma.Decimal {
    return new Prisma.Decimal(quantity).times(unitValue);
  }

  private sumItems(items: ContractItemInputType[]): Prisma.Decimal {
    return items.reduce(
      (sum, item) => sum.plus(this.subtotal(item.quantity, item.unitValue)),
      new Prisma.Decimal(0),
    );
  }
}
