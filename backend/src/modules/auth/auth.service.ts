import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const adminUser = this.config.get<string>('ADMIN_USER');
    const adminPass = this.config.get<string>('ADMIN_PASS');

    if (!adminUser || !adminPass) {
      throw new UnauthorizedException('Admin credentials not configured');
    }

    if (dto.username !== adminUser || dto.password !== adminPass) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    const payload = { sub: 'admin', username: adminUser };
    const token = await this.jwt.signAsync(payload);
    return { accessToken: token, user: { username: adminUser, role: 'admin' } };
  }
}
