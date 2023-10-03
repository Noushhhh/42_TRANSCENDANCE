import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SocketModule } from './socket/SocketModule';
// import { PrismaModule } from './prisma/prisma.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { SocketEvents } from './socket/SocketEvents';
import { SocketService } from './socket/socket.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({}),
    SocketModule,
    ChatModule,
    PrismaModule,
    GameModule
  ],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService, PrismaService, SocketEvents, SocketService],
})
export class AppModule {}