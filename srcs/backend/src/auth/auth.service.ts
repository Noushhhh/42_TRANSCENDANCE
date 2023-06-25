import { Injectable } from '@nestjs/common';
import { User, Bookmark } from  '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}
    signup() {
        return { msg: 'I have signed up' };
    }

    signin() {
        return { msg: 'I have signed in' };
    }
}
