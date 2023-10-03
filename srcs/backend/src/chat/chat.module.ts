import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { listUserConnected } from './socket.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module ({
    imports: [PrismaModule, ChatModule],
    controllers: [ChatController],
    providers: [ChatService, ConfigService, ChatGateway, listUserConnected, AuthService, JwtService],
})
export class ChatModule {}