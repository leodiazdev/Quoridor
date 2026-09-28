import { describe, it, expect } from 'vitest';
import { QuoridorGame } from '../src/game/QuoridorGame.js';

describe('QuoridorGame Aggregate Root', () => {
  it('initializes game with correct default state', () => {
    const game = QuoridorGame.create('game_1');
    const state = game.getState();

    expect(state.id).toBe('game_1');
    expect(state.status).toBe('IN_PROGRESS');
    expect(state.currentTurn).toBe('player1');
    expect(state.players.player1.position).toEqual({ row: 0, col: 4 });
    expect(state.players.player2.position).toEqual({ row: 8, col: 4 });
    expect(state.players.player1.wallsLeft).toBe(10);
    expect(state.players.player2.wallsLeft).toBe(10);
    expect(state.walls).toHaveLength(0);
    expect(state.winner).toBeNull();
  });

  it('alternates turns when moving pawn', () => {
    const game = QuoridorGame.create();

    game.movePawn('player1', { row: 1, col: 4 });
    let state = game.getState();
    expect(state.players.player1.position).toEqual({ row: 1, col: 4 });
    expect(state.currentTurn).toBe('player2');

    game.movePawn('player2', { row: 7, col: 4 });
    state = game.getState();
    expect(state.players.player2.position).toEqual({ row: 7, col: 4 });
    expect(state.currentTurn).toBe('player1');
  });

  it('rejects action if not player turn', () => {
    const game = QuoridorGame.create();
    expect(() => game.movePawn('player2', { row: 7, col: 4 })).toThrow(/not player2's turn/i);
  });

  it('places wall, decrements wallsLeft, and alternates turn', () => {
    const game = QuoridorGame.create();

    game.placeWall('player1', { row: 3, col: 3 }, 'HORIZONTAL');
    const state = game.getState();

    expect(state.walls).toHaveLength(1);
    expect(state.walls[0].placedBy).toBe('player1');
    expect(state.walls[0].anchor).toEqual({ row: 3, col: 3 });
    expect(state.players.player1.wallsLeft).toBe(9);
    expect(state.currentTurn).toBe('player2');
  });

  it('rejects wall placement when player has 0 walls left', () => {
    const game = new QuoridorGame({
      players: {
        player1: { id: 'player1', position: { row: 0, col: 4 }, wallsLeft: 0, targetRow: 8 },
        player2: { id: 'player2', position: { row: 8, col: 4 }, wallsLeft: 10, targetRow: 0 }
      },
      currentTurn: 'player1'
    });

    expect(() => game.placeWall('player1', { row: 2, col: 2 }, 'HORIZONTAL')).toThrow(/no walls remaining/i);
  });

  it('detects victory when player reaches their target row', () => {
    const game = new QuoridorGame({
      players: {
        player1: { id: 'player1', position: { row: 7, col: 4 }, wallsLeft: 10, targetRow: 8 },
        player2: { id: 'player2', position: { row: 8, col: 0 }, wallsLeft: 10, targetRow: 0 }
      },
      currentTurn: 'player1'
    });

    const finalState = game.movePawn('player1', { row: 8, col: 4 });
    expect(finalState.status).toBe('FINISHED');
    expect(finalState.winner).toBe('player1');

    // Future moves should be rejected
    expect(() => game.movePawn('player2', { row: 7, col: 4 })).toThrow(/not in progress/i);
  });
});
