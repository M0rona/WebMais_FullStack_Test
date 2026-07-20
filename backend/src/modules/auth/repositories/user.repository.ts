import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData) {
    return this.prisma.user.create({ data });
  }
}
