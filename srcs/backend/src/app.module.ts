import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// import { PrismaModule } from './prisma/prisma.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({}),
    ChatModule,
    PrismaModule,
    GameModule,
    StatsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, PrismaService, AuthService, JwtService],
})
export class AppModule {}