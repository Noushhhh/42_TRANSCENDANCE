import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChatService{

    constructor(private prisma: PrismaService) {}

    // async storeMessage(){

    //   console.log('storeMessage here...');

    //   await this.prisma.message.create({
    //     data: {
    //       content: 'BONJJJOUR',
    //       sender: {
    //         connect: {
    //           id: 2
    //         }
    //       },
    //       conversation: {
    //         connect: {
    //           id: 1
    //         }
    //       }
    //     },
    //     select: {
    //       id: true,
    //       content: true,
    //       sender: true,
    //       senderId: true,
    //       conversation: true,
    //       conversationId: true
    //     }
    //   });
      
    //     return 'first little things';
    // }
    
}
