import { Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client'

@Injectable()
export class UserService {
        constructor(
            private prisma: PrismaService,
        ) {}
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
