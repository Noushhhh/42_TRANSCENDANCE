import { Injectable } from '@nestjs/common';
// import { User, Bookmark } from  '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async signup(dto: AuthDto) {
        // generate password hash
        const hashPassword = await argon.hash(dto.password);
        // save user in db
        const user = await this.prisma.user.create({
            data: {
                username: "default",
                login: dto.login,
                hashPassword,
            },
        });
        // return saved user
        return user;
        // return { msg: 'I have signed up' };
    }

    signin() {
        return { msg: 'I have signed in' };
    }
}