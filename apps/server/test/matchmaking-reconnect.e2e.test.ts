import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module.js';

describe('Matchmaking & Reconnection E2E', () => {
  let app: INestApplication;
  let port: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);
    const serverAddress = app.getHttpServer().address();
    port = typeof serverAddress === 'object' && serverAddress ? serverAddress.port : 3001;
  });

  afterAll(async () => {
    await app.close();
  });

  it('automatically matches two players queueing without roomId into the same room', async () => {
    const serverUrl = `http://localhost:${port}`;
    const p1 = io(serverUrl, { transports: ['websocket'] });
    const p2 = io(serverUrl, { transports: ['websocket'] });

    await Promise.all([
      new Promise<void>((res) => p1.on('connect', res)),
      new Promise<void>((res) => p2.on('connect', res)),
    ]);

    const p1Joined = new Promise<any>((res) => p1.once('game:joined', res));
    // p1 requests match without room ID
    p1.emit('game:create_or_join', {});
    const p1Data = await p1Joined;
    expect(p1Data.assignedPlayerId).toBe('player1');

    const p2Joined = new Promise<any>((res) => p2.once('game:joined', res));
    // p2 requests match without room ID -> matches into p1's open room!
    p2.emit('game:create_or_join', {});
    const p2Data = await p2Joined;
    expect(p2Data.assignedPlayerId).toBe('player2');
    expect(p2Data.roomId).toBe(p1Data.roomId);

    p1.disconnect();
    p2.disconnect();
  });

  it('notifies opponent on player disconnect with grace period', async () => {
    const serverUrl = `http://localhost:${port}`;
    const p1 = io(serverUrl, { transports: ['websocket'] });
    const p2 = io(serverUrl, { transports: ['websocket'] });

    await Promise.all([
      new Promise<void>((res) => p1.on('connect', res)),
      new Promise<void>((res) => p2.on('connect', res)),
    ]);

    const testRoom = `DISCONNECT_TEST_${Date.now()}`;
    const p1Joined = new Promise<any>((res) => p1.once('game:joined', res));
    p1.emit('game:create_or_join', { roomId: testRoom, preferredSlot: 'player1' });
    await p1Joined;

    const p2Joined = new Promise<any>((res) => p2.once('game:joined', res));
    p2.emit('game:create_or_join', { roomId: testRoom, preferredSlot: 'player2' });
    await p2Joined;

    const disconnectNotice = new Promise<any>((res) => p2.once('game:player_disconnected', res));
    p1.disconnect();

    const noticeData = await disconnectNotice;
    expect(noticeData.playerId).toBe('player1');
    expect(noticeData.gracePeriodSeconds).toBe(30);

    p2.disconnect();
  });
});
