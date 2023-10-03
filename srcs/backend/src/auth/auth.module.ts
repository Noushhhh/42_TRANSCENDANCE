import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { JwtStrategy } from '../strategy/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../strategies/local-auth.strategy';
import { jwtConstants } from './constants/constants';

@Module({
  imports: [
      UsersModule,
      PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60 * 15s'}
  }), 
  ],
  // imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy],
  // controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}