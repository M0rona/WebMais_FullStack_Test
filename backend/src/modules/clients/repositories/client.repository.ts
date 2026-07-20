import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateClientDtoType, UpdateClientDtoType } from '../dto/client.dto';

@Injectable()
export class ClientRepository {
  constructor(private prisma: PrismaService) {}

  create(data: CreateClientDtoType) {
    return this.prisma.client.create({ data });
  }

  findMany() {
    return this.prisma.client.findMany({ orderBy: { name: 'asc' } });
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
