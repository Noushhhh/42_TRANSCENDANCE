import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
// import { SocketModule } from './socket/socket.module';
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
    UserModule,
    ConfigModule.forRoot({}),
    ChatModule,
    PrismaModule,
    GameModule
  ],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService, PrismaService, ChatGateway, listUserConnected, AuthService, JwtService],
})
export class AppModule {}