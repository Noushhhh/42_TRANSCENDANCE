
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';

// //Auth Passport Strategy
// import { PassportStrategy } from '@nestjs/passport';
// //Auth Jwt
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class jwtStrategy extends PassportStrategy(Strategy) {
//     constructor(private prisma: PrismaService) {
// 		super({
// 			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 			secretOrKey: process.env.JWT_SECRET,
// 		});
// 	}

//     async validate(data: { sub: number; email: string; is2FA: boolean }) {
// 		const user = await this.prisma.user.findUnique({
// 			where: {
// 				id: data.sub,
// 			},
// 		});
// 		// if user is logged out return 401
// 		if (!user.hashedRtoken) return;
// 		// remove sensitive data
// 		if (user) delete user.hash;
// 		// if the user is not found user == NULL
// 		// 401 forbidden is returned.
// 		if (!user.twoFA) {
// 			return user;
// 		}
// 		if (data.is2FA) {
// 			return user;
// 		}
// 	}
// }

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
  }) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });
    // delete user.hashPassword;
    return user;
  }
}