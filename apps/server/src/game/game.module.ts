import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway.js';
import { RoomManager } from './room.manager.js';

@Module({
  providers: [GameGateway, RoomManager],
  exports: [RoomManager]
})
export class GameModule {}
