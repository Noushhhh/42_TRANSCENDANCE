import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { listUserConnected } from './socket.service';

@Module ({
    imports: [PrismaModule, ChatModule],
    controllers: [ChatController],
    providers: [ChatService, ConfigService, ChatGateway, listUserConnected],
})
export class ChatModule {}