import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketModule } from './socket/socket.module';

@Module({
  // imports: [
  //   TypeOrmModule.forRoot({
  //     type: 'postgres',
  //     host: process.env.POSTGRES_HOST || 'localhost',
  //     port: 5432,
  //     username: process.env.POSTGRES_USER,
  //     password: process.env.POSTGRES_PASSWORD,
  //     database: process.env.POSTGRES_DB,
  //     autoLoadEntities: true,
  //     synchronize: true,
  //   }),
  // ],
  imports: [SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}