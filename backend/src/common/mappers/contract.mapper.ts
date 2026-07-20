import { Client, Contract, ContractItem } from '../../infra/prisma/prisma-client';

type ContractWithRelations = Contract & {
  client?: Partial<Client>;
  items?: ContractItem[];
};

export interface ContractItemResponseDto {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  subtotal: number;
}

export interface ContractResponseDto {
  id: string;
  number: string;
  type: string;
  value: number;
  dueDate: Date;
  status: string;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client?: { id: string; name: string; document: string };
  items?: ContractItemResponseDto[];
}

export class ContractMapper {
  static toResponse(contract: ContractWithRelations): ContractResponseDto {
    return {
      id: contract.id,
      number: contract.number,
      type: contract.type,
      value: Number(contract.value),
      dueDate: contract.dueDate,
      status: contract.status,
      closedAt: contract.closedAt,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      client:
        contract.client?.id && contract.client.name && contract.client.document
          ? {
              id: contract.client.id,
              name: contract.client.name,
              document: contract.client.document,
            }
          : undefined,
      items: contract.items?.map((item) => ContractMapper.itemToResponse(item)),
    };
  }

  static toResponseList(contracts: ContractWithRelations[]): ContractResponseDto[] {
    return contracts.map((contract) => ContractMapper.toResponse(contract));
  }

  static itemToResponse(item: ContractItem): ContractItemResponseDto {
    return {
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitValue: Number(item.unitValue),
      subtotal: Number(item.subtotal),
    };
  }
}
