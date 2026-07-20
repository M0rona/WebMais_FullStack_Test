import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { getJwtExpiresInSeconds } from '../../common/utils/jwt.util';
import { AuthResponseDto, LoginDtoType, RegisterDtoType } from './dto/auth.dto';
import { UserRepository } from './repositories/user.repository';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDtoType): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    const hashedPassword = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  async login(dto: LoginDtoType): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  private buildAuthResponse(id: string, email: string, name: string): AuthResponseDto {
    const accessToken = this.jwtService.sign(
      { sub: id, email },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: getJwtExpiresInSeconds(this.configService),
      },
    );
    return { accessToken, user: { id, email, name } };
  }
}
