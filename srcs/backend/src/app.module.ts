import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
// import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { SocketModule } from './socket/SocketModule';
import { GatewayModule } from './game/gateway/gateway.module';
// import { PrismaModule } from './prisma/prisma.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookmarkModule,
    SocketModule,
    GatewayModule,
    ChatModule,
    PrismaModule
  ],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService, PrismaService],
})
export class AppModule {}