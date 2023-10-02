import { Injectable } from "@nestjs/common";
import { Req} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

// import { User } from '@prisma/client'

@Injectable()
export class UserService {
        constructor(
            // private prisma: PrismaService,
            private config: ConfigService,
        ) {}

        getMe(@Req() req: Request) {
            try {
                console.log('get me called');
                const jwtCookie = req.cookies['token'];
                const secret = this.config.get('JWT_SECRET');
                const user = jwt.verify(jwtCookie, secret);
                return user;
            } catch (error){
                console.log(error);
            }
        }
}
// // //     async set2faSecret(secret: string, id: string) {
// // //         const user = await this.usersRepository.findOneBy({id});
    
// // //         user.twoFactorSecret = secret;
// // //         await this.usersRepository.save(user);
// // //         return (user.twoFactorSecret);
// // //     }
// // // }

//     async findUserByUsername(username: string): Promise<User | null> {
//         return this.prisma.user.findUnique({
//             where: {
//                 username,
//             },
//         });
//     }
// }

//     // async getUsernameFromId(id: number): Promise<string | undefined>{

//     //     const userId = Number(id);

//     //     try {
//     //         const user: { username: string; } | null = await this.prisma.user.findUnique({
//     //             where: {
//     //                 id: userId,
//     //             },
//     //             select: {
//     //                 username: true,
//     //             }
//     //         })
//     //         if (user){
//     //             console.log(user.username);
//     //             return user.username;
//     //         }
//     //         else{
//     //             return undefined;
//     //         }
//     //     } catch (error){
//     //         throw error;
//     //     }
//     // 
