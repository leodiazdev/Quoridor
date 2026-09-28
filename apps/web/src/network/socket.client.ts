import { io, Socket } from 'socket.io-client';
import { GameState, Position, WallOrientation, PlayerId } from '@quoridor/core';

export interface SocketEvents {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onJoined?: (roomId: string, assignedRole: PlayerId | 'spectator', state: GameState, legalMoves: Position[]) => void;
  onStateUpdated?: (state: GameState, legalMoves: Position[]) => void;
  onActionRejected?: (reason: string) => void;
  onGameOver?: (winner: PlayerId, state: GameState) => void;
  onPlayerDisconnected?: (playerId: PlayerId, graceSeconds: number) => void;
}

export class SocketClient {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;
  private currentRole: PlayerId | 'spectator' | null = null;

  constructor(private readonly events: SocketEvents) {}

  public connect(serverUrl?: string) {
    const defaultUrl =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001'
        : window.location.origin;

    const url = serverUrl || defaultUrl;

    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.events.onConnected?.();
      // If was previously in a room, attempt auto rejoin
      if (this.currentRoomId && this.currentRole) {
        this.joinRoom(this.currentRoomId, this.currentRole as PlayerId);
      }
    });

    this.socket.on('disconnect', () => {
      this.events.onDisconnected?.();
    });

    this.socket.on('game:joined', (data: any) => {
      this.currentRoomId = data.roomId;
      this.currentRole = data.assignedPlayerId;
      this.events.onJoined?.(data.roomId, data.assignedPlayerId, data.state, data.legalMoves);
    });

    this.socket.on('game:state_updated', (data: any) => {
      this.events.onStateUpdated?.(data.state, data.legalMoves);
    });

    this.socket.on('game:action_rejected', (data: any) => {
      this.events.onActionRejected?.(data.reason);
    });

    this.socket.on('game:game_over', (data: any) => {
      this.events.onGameOver?.(data.winner, data.state);
    });

    this.socket.on('game:player_disconnected', (data: any) => {
      this.events.onPlayerDisconnected?.(data.playerId, data.gracePeriodSeconds);
    });
  }

  public isConnected(): boolean {
    return !!this.socket?.connected;
  }

  public joinRoom(roomId?: string, preferredSlot?: PlayerId) {
    if (!this.socket) return;
    this.socket.emit('game:create_or_join', { roomId, preferredSlot });
  }

  public movePawn(row: number, col: number) {
    if (!this.socket || !this.currentRoomId) return;
    this.socket.emit('game:move_pawn', {
      roomId: this.currentRoomId,
      row,
      col,
    });
  }

  public placeWall(row: number, col: number, orientation: WallOrientation) {
    if (!this.socket || !this.currentRoomId) return;
    this.socket.emit('game:place_wall', {
      roomId: this.currentRoomId,
      row,
      col,
      orientation,
    });
  }

  public getRoomId(): string | null {
    return this.currentRoomId;
  }

  public getRole(): PlayerId | 'spectator' | null {
    return this.currentRole;
  }

  public disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.currentRoomId = null;
    this.currentRole = null;
  }
}
