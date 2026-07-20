import { Client } from '../../infra/prisma/prisma-client';

export interface ClientResponseDto {
  id: string;
  name: string;
  document: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ClientMapper {
  static toResponse(client: Client): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      document: client.document,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  static toResponseList(clients: Client[]): ClientResponseDto[] {
    return clients.map((client) => ClientMapper.toResponse(client));
  }
}
