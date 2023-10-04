import { Injectable, NotFoundException, Request } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async findUserbyId(userId: number): Promise<User | undefined> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            if (!user) {
                throw new NotFoundException(`User not found with id ${userId}`);
            }

            return user;
        } catch (error) {
            console.error(`Error fetching user with id ${userId}`, error);
            throw error;
        }
    }
    
    async findUserByUsername(usernameinput: string): Promise<User | undefined> {
        try {
            const user = await this.prisma.user.findUnique({
            where: {
                username: usernameinput,
            },
        });
        if (!user) {
            throw new NotFoundException(`User not found with id ${usernameinput}`);
        }
        return user;
        } catch (error) {
            console.error(`Error fetching user with id ${usernameinput}`, error);
            throw error;
        }
    }

    // async findUserByUsernameReq(@Request() req: Request) {
    //     try {
    //         const user = await this.prisma.user.findUnique({
    //         where: {
    //             username: req.user.username,
    //         },
    //     });
    //     if (!user) {
    //         throw new NotFoundException(`User not found with id ${usernameinput}`);
    //     }
    //     return user;
    //     } catch (error) {
    //         console.error(`Error fetching user with id ${usernameinput}`, error);
    //         throw error;
    //     }
    // }
}
