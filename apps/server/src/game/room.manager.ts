import { Injectable } from '@nestjs/common';
import { QuoridorGame, PlayerId } from '@quoridor/core';
import { GameRoom, ConnectedPlayer } from './room.types.js';

@Injectable()
export class RoomManager {
  private readonly rooms = new Map<string, GameRoom>();
  private readonly socketToRoom = new Map<string, string>();
  private readonly RECONNECTION_GRACE_MS = 30000; // 30-second grace period

  public createRoom(customId?: string): GameRoom {
    const id = customId || Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: GameRoom = {
      id,
      game: QuoridorGame.create(id),
      player1: null,
      player2: null,
      spectators: [],
      createdAt: Date.now(),
      lastActive: Date.now()
    };
    this.rooms.set(id, room);
    return room;
  }

  public getRoom(id: string): GameRoom | undefined {
    return this.rooms.get(id);
  }

  public getRoomBySocket(socketId: string): GameRoom | undefined {
    const roomId = this.socketToRoom.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  public findOpenRoom(): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (!room.player1 || !room.player2) {
        return room;
      }
    }
    return undefined;
  }

  public joinRoom(
    roomId: string,
    socketId: string,
    preferredSlot?: PlayerId,
    username?: string
  ): { room: GameRoom; slot: PlayerId | 'spectator' } {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }

    this.socketToRoom.set(socketId, room.id);
    room.lastActive = Date.now();

    // Check if re-connecting to existing slot
    if (preferredSlot === 'player1' && room.player1 && room.player1.disconnectedAt) {
      clearTimeout(room.player1.disconnectTimeout);
      room.player1.socketId = socketId;
      room.player1.disconnectedAt = undefined;
      room.player1.disconnectTimeout = undefined;
      return { room, slot: 'player1' };
    }

    if (preferredSlot === 'player2' && room.player2 && room.player2.disconnectedAt) {
      clearTimeout(room.player2.disconnectTimeout);
      room.player2.socketId = socketId;
      room.player2.disconnectedAt = undefined;
      room.player2.disconnectTimeout = undefined;
      return { room, slot: 'player2' };
    }

    // Try slot assignment
    if (!room.player1 && (!preferredSlot || preferredSlot === 'player1')) {
      room.player1 = { socketId, playerId: 'player1', username };
      return { room, slot: 'player1' };
    }

    if (!room.player2 && (!preferredSlot || preferredSlot === 'player2')) {
      room.player2 = { socketId, playerId: 'player2', username };
      return { room, slot: 'player2' };
    }

    if (!room.player1) {
      room.player1 = { socketId, playerId: 'player1', username };
      return { room, slot: 'player1' };
    }

    if (!room.player2) {
      room.player2 = { socketId, playerId: 'player2', username };
      return { room, slot: 'player2' };
    }

    // Room is full, join as spectator
    if (!room.spectators.includes(socketId)) {
      room.spectators.push(socketId);
    }
    return { room, slot: 'spectator' };
  }

  public getPlayerRole(room: GameRoom, socketId: string): PlayerId | 'spectator' | null {
    if (room.player1?.socketId === socketId) return 'player1';
    if (room.player2?.socketId === socketId) return 'player2';
    if (room.spectators.includes(socketId)) return 'spectator';
    return null;
  }

  public handleDisconnect(
    socketId: string,
    onForfeit: (room: GameRoom, forfeitedPlayer: PlayerId) => void
  ): { room: GameRoom; disconnectedPlayer: ConnectedPlayer } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    this.socketToRoom.delete(socketId);
    const room = this.rooms.get(roomId);
    if (!room) return null;

    let targetPlayer: ConnectedPlayer | null = null;
    if (room.player1?.socketId === socketId) {
      targetPlayer = room.player1;
    } else if (room.player2?.socketId === socketId) {
      targetPlayer = room.player2;
    } else {
      // Spectator disconnected
      room.spectators = room.spectators.filter((s) => s !== socketId);
      return null;
    }

    targetPlayer.disconnectedAt = Date.now();
    targetPlayer.disconnectTimeout = setTimeout(() => {
      // If still disconnected after grace period, trigger forfeit
      if (targetPlayer?.disconnectedAt) {
        onForfeit(room, targetPlayer.playerId);
      }
    }, this.RECONNECTION_GRACE_MS);

    return { room, disconnectedPlayer: targetPlayer };
  }

  public deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      if (room.player1?.disconnectTimeout) clearTimeout(room.player1.disconnectTimeout);
      if (room.player2?.disconnectTimeout) clearTimeout(room.player2.disconnectTimeout);
      if (room.player1) this.socketToRoom.delete(room.player1.socketId);
      if (room.player2) this.socketToRoom.delete(room.player2.socketId);
      room.spectators.forEach((s) => this.socketToRoom.delete(s));
      this.rooms.delete(roomId);
    }
  }
}
