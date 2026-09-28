import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module.js';

describe('GameGateway E2E WebSocket Integration', () => {
  let app: INestApplication;
  let port: number;
  let client1: Socket;
  let client2: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0); // Dynamic random port
    const serverAddress = app.getHttpServer().address();
    port = typeof serverAddress === 'object' && serverAddress ? serverAddress.port : 3001;
  });

  afterAll(async () => {
    if (client1?.connected) client1.disconnect();
    if (client2?.connected) client2.disconnect();
    await app.close();
  });

  it('connects two players, executes valid moves, and rejects invalid moves', async () => {
    const serverUrl = `http://localhost:${port}`;
    const testRoom = `TEST_ROOM_${Date.now()}`;

    // Connect client 1
    client1 = io(serverUrl, { transports: ['websocket'] });
    await new Promise<void>((resolve) => client1.on('connect', resolve));

    // Connect client 2
    client2 = io(serverUrl, { transports: ['websocket'] });
    await new Promise<void>((resolve) => client2.on('connect', resolve));

    // Client 1 joins as player1
    const p1JoinedPromise = new Promise<any>((resolve) => {
      client1.once('game:joined', resolve);
    });
    client1.emit('game:create_or_join', { roomId: testRoom, preferredSlot: 'player1' });
    const p1JoinData = await p1JoinedPromise;

    expect(p1JoinData.roomId).toBe(testRoom);
    expect(p1JoinData.assignedPlayerId).toBe('player1');
    expect(p1JoinData.state.currentTurn).toBe('player1');

    // Client 2 joins as player2
    const p2JoinedPromise = new Promise<any>((resolve) => {
      client2.once('game:joined', resolve);
    });
    client2.emit('game:create_or_join', { roomId: testRoom, preferredSlot: 'player2' });
    const p2JoinData = await p2JoinedPromise;

    expect(p2JoinData.roomId).toBe(testRoom);
    expect(p2JoinData.assignedPlayerId).toBe('player2');

    // 1. Client 1 sends INVALID move (e.g. jump across board to (7, 4))
    const p1RejectPromise = new Promise<any>((resolve) => {
      client1.once('game:action_rejected', resolve);
    });
    client1.emit('game:move_pawn', { roomId: testRoom, row: 7, col: 4 });
    const rejectData = await p1RejectPromise;
    expect(rejectData.reason).toMatch(/illegal/i);

    // 2. Client 1 sends VALID move to (1, 4)
    const p1UpdatePromise = new Promise<any>((resolve) => {
      client1.once('game:state_updated', resolve);
    });
    const p2UpdatePromise = new Promise<any>((resolve) => {
      client2.once('game:state_updated', resolve);
    });

    client1.emit('game:move_pawn', { roomId: testRoom, row: 1, col: 4 });

    const [p1State, p2State] = await Promise.all([p1UpdatePromise, p2UpdatePromise]);
    expect(p1State.state.players.player1.position).toEqual({ row: 1, col: 4 });
    expect(p2State.state.players.player1.position).toEqual({ row: 1, col: 4 });
    expect(p1State.state.currentTurn).toBe('player2');

    // 3. Client 2 places a valid wall
    const wallUpdatePromise = new Promise<any>((resolve) => {
      client1.once('game:state_updated', resolve);
    });

    client2.emit('game:place_wall', {
      roomId: testRoom,
      row: 5,
      col: 4,
      orientation: 'HORIZONTAL'
    });

    const wallState = await wallUpdatePromise;
    expect(wallState.state.walls).toHaveLength(1);
    expect(wallState.state.walls[0].placedBy).toBe('player2');
    expect(wallState.state.currentTurn).toBe('player1');

    // 4. Client 1 tries to place an overlapping wall at the exact same location
    const overlapRejectPromise = new Promise<any>((resolve) => {
      client1.once('game:action_rejected', resolve);
    });
    client1.emit('game:place_wall', {
      roomId: testRoom,
      row: 5,
      col: 4,
      orientation: 'HORIZONTAL'
    });
    const overlapReject = await overlapRejectPromise;
    expect(overlapReject.reason).toMatch(/overlaps or intersects/i);
  });
});
