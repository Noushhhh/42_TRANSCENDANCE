import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Module ({
    imports: [PrismaModule],
    controllers: [ChatController],
    providers: [ChatService, ConfigService, ChatGateway, AuthService, JwtService, UsersService],
})
export class ChatModule {}