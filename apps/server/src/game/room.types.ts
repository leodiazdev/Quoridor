import { GameState, PlayerId, Position, WallOrientation, GameAction } from '@quoridor/core';

export interface ConnectedPlayer {
  socketId: string;
  playerId: PlayerId;
  username?: string;
  disconnectedAt?: number;
  disconnectTimeout?: NodeJS.Timeout;
}

export interface GameRoom {
  id: string;
  game: any; // QuoridorGame instance
  player1: ConnectedPlayer | null;
  player2: ConnectedPlayer | null;
  spectators: string[];
  createdAt: number;
  lastActive: number;
}

export interface CreateOrJoinDto {
  roomId?: string;
  preferredSlot?: PlayerId;
  username?: string;
}

export interface MovePawnDto {
  roomId: string;
  row: number;
  col: number;
}

export interface PlaceWallDto {
  roomId: string;
  row: number;
  col: number;
  orientation: WallOrientation;
}

export interface StateUpdatedPayload {
  state: GameState;
  legalMoves: Position[];
  lastAction?: GameAction;
}

export interface ActionRejectedPayload {
  reason: string;
  action?: string;
}

export interface GameOverPayload {
  winner: PlayerId;
  state: GameState;
}

export interface JoinedPayload {
  roomId: string;
  assignedPlayerId: PlayerId | 'spectator';
  state: GameState;
  legalMoves: Position[];
}
