import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
// import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { SocketModule } from './socket/SocketModule';
// import { PrismaModule } from './prisma/prisma.module';

@Module({
  // 14/06/2023 pmulin => Pour se connecter a la bdd,
  // decommenter l'import du TYPEOrm,
  // Je l'ai commente car il ne fonctionnait pas. a debugger
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    // imports: [
    //   ConfigModule.forRoot({
    //     isGlobal: true,
    //    }),
    AuthModule,
    UserModule,
    BookmarkModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}