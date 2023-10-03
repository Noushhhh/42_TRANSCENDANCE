import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthDto } from '../auth/dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(dto: AuthDto): Promise<any> {
    const user = await this.authService.validateUser(dto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}