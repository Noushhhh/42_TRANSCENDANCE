import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SocketEvents } from '../socket/SocketEvents';
import { SocketModule } from '../socket/SocketModule';
import { SocketService } from '../socket/socket.service';
import { ConfigService } from '@nestjs/config';

@Module ({
    imports: [PrismaModule, SocketModule],
    controllers: [ChatController],
    providers: [ChatService, SocketService, SocketEvents, ConfigService],
})
export class ChatModule {}