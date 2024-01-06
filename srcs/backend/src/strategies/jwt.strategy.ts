
// jwt.strategy.ts
import { Injectable, UnauthorizedException, Logger} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from '../auth/constants/constants';
import { AuthService } from '../auth/auth.service';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);
    constructor(
        private readonly userService: UsersService,
        private readonly authService: AuthService,

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
        const sessionId = payload.sessionId; // Extracting the sessionId from the payload

        const isValidSession = await this.authService.validateSession(user.id, sessionId);
        this.logger.debug(`Passing  by JwtStrategy isValidSession: ${isValidSession}\nuserName: ${user.username} \n`);
        if (!user || !isValidSession) {
            throw new UnauthorizedException();
        }
        return user;
    }
}

