// // Importing necessary libraries and decorators
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';

// // Making JwtStrategy an injectable service
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       // Function to extract JWT from request
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       // Configuration to enforce token expiration
//       ignoreExpiration: false,
//       // Secret key for JWT signing and verification
//       secretOrKey: process.env.JWT_SECRET,
      
//     });
//   }

//   // Validation function to extract necessary data from token payload
//   async validate(payload: any) {
//     return payload;
//   }
// }

// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { jwtConstants } from '../auth/constants/constants';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       // secretOrKey: process.env.JWT_SECRET,
//       secretOrKey: jwtConstants.secret,
//     });
//   }

//   async validate(payload: any) {
//     console.log("PAYLOAD==", payload);
//     return { username: payload.username };
//   }
// }

// jwt.strategy.ts
import { Injectable, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from '../auth/constants/constants';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UsersService,

    ) {
        super({
          jwtFromRequest: (req: any) => {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies['token'];
            }
            return token;
        },
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
            passReqToCallback: true
        });
    }

    async validate(req: any, payload: any) {
      const user = await this.userService.findUserWithId(payload.sub);
      if (!user) {
          throw new UnauthorizedException();
      }
      return user;
  }
}

