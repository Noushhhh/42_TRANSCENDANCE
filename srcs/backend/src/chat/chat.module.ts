import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from '../socket/chat.gateway';
import { SocketModule } from '../socket/socket.module';
import { SocketService } from '../socket/socket.service';
import { ConfigService } from '@nestjs/config';

@Module ({
    imports: [PrismaModule, SocketModule],
    controllers: [ChatController],
    providers: [ChatService, SocketService, ChatGateway, ConfigService],
})
export class ChatModule {}