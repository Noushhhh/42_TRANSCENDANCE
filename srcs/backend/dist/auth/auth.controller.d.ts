import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private authService;
    private prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    signup(dto: SignUpDto): Promise<import("./dto").AuthTokenDto>;
    signin(dto: SignInDto): Promise<import("./dto").AuthTokenDto>;
    token(req: any): Promise<void>;
}
