import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenDto, SignUpDto, SignInDto } from './dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    signup(dto: SignUpDto): Promise<AuthTokenDto>;
    signin(dto: SignInDto): Promise<AuthTokenDto>;
    signJwtToken(userId: number, email: string): Promise<AuthTokenDto>;
    signToken42(req: any): Promise<void>;
    private exchangeCodeForToken;
    private getUserInfo;
    createUser(userInfo: any): Promise<void>;
}
