import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Inject, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PlayerId } from '@quoridor/core';
import { RoomManager } from './room.manager.js';
import {
  CreateOrJoinDto,
  MovePawnDto,
  PlaceWallDto,
  StateUpdatedPayload,
  GameOverPayload,
  JoinedPayload
} from './room.types.js';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(@Inject(RoomManager) private readonly roomManager: RoomManager) {}

  handleConnection(client: Socket) {
    // Client connected
  }

  handleDisconnect(client: Socket) {
    const result = this.roomManager.handleDisconnect(client.id, (room, forfeitedPlayer) => {
      // Grace period expired: declare opponent the winner
      const opponentId: PlayerId = forfeitedPlayer === 'player1' ? 'player2' : 'player1';
      const state = room.game.getState();
      state.winner = opponentId;
      state.status = 'FINISHED';

      const payload: GameOverPayload = {
        winner: opponentId,
        state
      };
      this.server.to(room.id).emit('game:game_over', payload);
    });

    if (result) {
      const { room, disconnectedPlayer } = result;
      this.server.to(room.id).emit('game:player_disconnected', {
        playerId: disconnectedPlayer.playerId,
        gracePeriodSeconds: 30
      });
    }
  }

  @SubscribeMessage('game:create_or_join')
  handleCreateOrJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateOrJoinDto = {}
  ) {
    let targetRoomId = dto.roomId;
    if (!targetRoomId) {
      const openRoom = this.roomManager.findOpenRoom();
      targetRoomId = openRoom ? openRoom.id : undefined;
    }

    const { room, slot } = this.roomManager.joinRoom(
      targetRoomId || `ROOM_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      client.id,
      dto.preferredSlot,
      dto.username
    );

    client.join(room.id);

    const gameState = room.game.getState();
    const legalMoves = slot === 'spectator' ? [] : room.game.getLegalMoves(slot);

    const response: JoinedPayload = {
      roomId: room.id,
      assignedPlayerId: slot,
      state: gameState,
      legalMoves
    };

    client.emit('game:joined', response);

    // If both players are present, announce game start/state update to room
    if (room.player1 && room.player2) {
      const currentTurn = gameState.currentTurn;
      const turnLegalMoves = room.game.getLegalMoves(currentTurn);

      const updatePayload: StateUpdatedPayload = {
        state: gameState,
        legalMoves: turnLegalMoves
      };
      this.server.to(room.id).emit('game:state_updated', updatePayload);
      this.server.to(room.id).emit('game:started', { roomId: room.id, state: gameState });
    }
  }

  @SubscribeMessage('game:move_pawn')
  handleMovePawn(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: MovePawnDto
  ) {
    const room = this.roomManager.getRoom(dto.roomId);
    if (!room) {
      client.emit('game:action_rejected', { reason: 'Room not found.' });
      return;
    }

    const playerRole = this.roomManager.getPlayerRole(room, client.id);
    if (!playerRole || playerRole === 'spectator') {
      client.emit('game:action_rejected', { reason: 'You are not an active player in this room.' });
      return;
    }

    try {
      const targetPos = { row: dto.row, col: dto.col };
      const updatedState = room.game.movePawn(playerRole, targetPos);
      const nextTurnMoves = room.game.getLegalMoves(updatedState.currentTurn);

      const payload: StateUpdatedPayload = {
        state: updatedState,
        legalMoves: nextTurnMoves,
        lastAction: updatedState.history[updatedState.history.length - 1]
      };

      this.server.to(room.id).emit('game:state_updated', payload);

      if (updatedState.winner) {
        const gameOverPayload: GameOverPayload = {
          winner: updatedState.winner,
          state: updatedState
        };
        this.server.to(room.id).emit('game:game_over', gameOverPayload);
      }
    } catch (err: any) {
      client.emit('game:action_rejected', {
        reason: err.message || 'Invalid pawn move.'
      });
    }
  }

  @SubscribeMessage('game:place_wall')
  handlePlaceWall(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: PlaceWallDto
  ) {
    const room = this.roomManager.getRoom(dto.roomId);
    if (!room) {
      client.emit('game:action_rejected', { reason: 'Room not found.' });
      return;
    }

    const playerRole = this.roomManager.getPlayerRole(room, client.id);
    if (!playerRole || playerRole === 'spectator') {
      client.emit('game:action_rejected', { reason: 'You are not an active player in this room.' });
      return;
    }

    try {
      const anchor = { row: dto.row, col: dto.col };
      const updatedState = room.game.placeWall(playerRole, anchor, dto.orientation);
      const nextTurnMoves = room.game.getLegalMoves(updatedState.currentTurn);

      const payload: StateUpdatedPayload = {
        state: updatedState,
        legalMoves: nextTurnMoves,
        lastAction: updatedState.history[updatedState.history.length - 1]
      };

      this.server.to(room.id).emit('game:state_updated', payload);
    } catch (err: any) {
      client.emit('game:action_rejected', {
        reason: err.message || 'Invalid wall placement.'
      });
    }
  }
}
