// Import necessary modules and services
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from '../auth/constants/constants';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    // Create a logger instance for logging
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(
        private readonly userService: UsersService,
        private readonly authService: AuthService,
    ) {
        // Call the constructor of PassportStrategy with JWT strategy options
        super({
            jwtFromRequest: (req: any) => {
                let token = null;
                if (req && req.cookies) {
                    // Extract the JWT token from the request's cookies
                    token = req.cookies['token'];
                }
                return token;
            },
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret, // Set the JWT secret key
            passReqToCallback: true, // Pass the request object to the callback function
        });
    }

    // Validate function is called when a request is processed with the JWT token
    async validate(req: any, payload: any) {
        // Find the user based on the user ID (sub) from the JWT payload
        const user = await this.userService.findUserWithId(payload.sub);
        
        // Extract the sessionId from the payload
        const sessionId = payload.sessionId;

        // Check if the session is valid for the user
        const isValidSession = await this.authService.validateSession(user.id, sessionId);

        // Log the debug information
        this.logger.debug(`Passing by JwtStrategy isValidSession: ${isValidSession}\nuserName: ${user.username} \n`);

        // If the user is not found or the session is not valid, throw an UnauthorizedException
        if (!user || !isValidSession) {
            throw new UnauthorizedException();
        }

        // Return the user object, which will be available in the request
        return user;
    }
}
