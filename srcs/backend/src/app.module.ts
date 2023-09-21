import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { SocketModule } from './socket/SocketModule';
// import { PrismaModule } from './prisma/prisma.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { GameModule } from './game/game.module';
import { SocketEvents } from './socket/SocketEvents';
import { SocketService } from './socket/socket.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookmarkModule,
    ConfigModule.forRoot({}),
    SocketModule,
    PrismaModule,
    GameModule,
  ],
  controllers: [AppController ],
  providers: [AppService, PrismaService, SocketEvents, SocketService],
})
export class AppModule {}