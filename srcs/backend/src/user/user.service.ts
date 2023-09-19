// import { Inject, Injectable } from "@nestjs/common";
// import { Prisma } from "@prisma/client";

// @Injectable({})
// export class UserService {

//     async set2faSecret(secret: string, id: string) {
//         const user = await this.usersRepository.findOneBy({id});
    
//         user.twoFactorSecret = secret;
//         await this.usersRepository.save(user);
//         return (user.twoFactorSecret);
//     }
// }