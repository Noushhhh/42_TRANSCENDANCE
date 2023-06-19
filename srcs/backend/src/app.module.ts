import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
// import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { SocketModule } from './socket/SocketModule';
import { GatewayModule } from './game/gateway/gateway.module';
// import { PrismaModule } from './prisma/prisma.module';

@Module({
  // 14/06/2023 pmulin => Pour se connecter a la bdd,
  // decommenter l'import du TYPEOrm,
  // Je l'ai commente car il ne fonctionnait pas. a debugger
  imports: [
    AuthModule,
    UserModule,
    BookmarkModule,
    SocketModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}