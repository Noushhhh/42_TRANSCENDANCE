import { Injectable, NotFoundException, Request, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async validateUser(username: string): Promise <any> {
        const user = await this.findUserWithUsername(username);
        if (!user)
          throw new UnauthorizedException();      
        return user;
      }

    async findUserWithId(userId: number): Promise<User> {
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
    
    async getUsernameWithId(userId: number): Promise<string> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new NotFoundException(`User not found with id ${userId}`);
            }
            return user.username;
        } catch (error) {
            console.error(`Error fetching user with id ${userId}`, error);
            throw error;
        }
    }
    

    async findUserWithUsername(usernameinput: string): Promise<User | undefined> {
        console.log("username INPUT ====", usernameinput);
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
}
