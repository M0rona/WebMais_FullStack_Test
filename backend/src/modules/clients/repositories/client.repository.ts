import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../infra/prisma/prisma-client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateClientDtoType, UpdateClientDtoType } from '../dto/client.dto';

interface FindManyFilters {
  search?: string;
  page: number;
  limit: number;
}

@Injectable()
export class ClientRepository {
  constructor(private prisma: PrismaService) {}

  create(data: CreateClientDtoType) {
    return this.prisma.client.create({ data });
  }

  async findMany(filters: FindManyFilters) {
    const { page, limit, search } = filters;
    const skip = (page - 1) * limit;
    const where: Prisma.ClientWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { document: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  findByDocument(document: string) {
    return this.prisma.client.findUnique({ where: { document } });
  }

  update(id: string, data: UpdateClientDtoType) {
    return this.prisma.client.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }

  countContracts(clientId: string) {
    return this.prisma.contract.count({ where: { clientId } });
  }
}
