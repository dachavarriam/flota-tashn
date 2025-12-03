import {
  Injectable,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(correo: string, plainPassword: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { correo }
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(plainPassword, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, ...rest } = user;
    return rest;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.correo, dto.password);

    const payload: JwtPayload = {
      sub: user.id,
      correo: user.correo,
      rol: user.rol
    };

    return {
      access_token: this.jwtService.sign(payload),
      user
    };
  }

  async me(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { password, ...rest } = user;
    return rest;
  }
}
