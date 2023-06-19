import { Module } from '@nestjs/common';
import { MultiplayerController } from './multiplayer.controller';

@Module({
  controllers: [MultiplayerController]
})
export class MultiplayerModule {}
