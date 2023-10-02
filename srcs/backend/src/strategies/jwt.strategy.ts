// Importing necessary libraries and decorators
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

// Making JwtStrategy an injectable service
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      // Function to extract JWT from request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Configuration to enforce token expiration
      ignoreExpiration: false,
      // Secret key for JWT signing and verification
      secretOrKey: process.env.JWT_SECRET,
      
    });
  }

  // Validation function to extract necessary data from token payload
  async validate(payload: any) {
    // Add custom validation logic here based on payload (e.g., verify user exists)
    // return this.authService.validateUser(payload);
    return { id: payload.sub, login: payload.login };
  }
}