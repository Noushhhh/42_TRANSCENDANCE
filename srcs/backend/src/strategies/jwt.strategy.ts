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

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../auth/constants/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}