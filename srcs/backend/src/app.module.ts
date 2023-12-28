import { Module, MiddlewareConsumer, NestModule} from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// import { PrismaModule } from './prisma/prisma.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { SocketService } from './chat/socket.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { StatsModule } from './stats/stats.module';
import { LoggerMiddleware } from './middleWares/logger.middleware';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({isGlobal: true}),
    ChatModule,
    PrismaModule,
    GameModule,
    StatsModule,
  ],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService, PrismaService, SocketService, AuthService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Apply for all routes
  }
}