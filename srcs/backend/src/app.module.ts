import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> c82b51bc15794599261efcb8dd3e4d9311d6ddb6
=======
>>>>>>> c82b51bc15794599261efcb8dd3e4d9311d6ddb6
import { SocketModule } from './socket/SocketModule';
>>>>>>> c82b51bc15794599261efcb8dd3e4d9311d6ddb6
// import { PrismaModule } from './prisma/prisma.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { ChatGateway } from './chat/chat.gateway';
import { listUserConnected } from './chat/socket.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({}),
    ChatModule,
    PrismaModule,
    GameModule
  ],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService, PrismaService, ChatGateway, listUserConnected, AuthService, JwtService],
})
export class AppModule {}