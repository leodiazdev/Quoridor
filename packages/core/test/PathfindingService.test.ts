import { describe, it, expect } from 'vitest';
import { PathfindingService } from '../src/pathfinding/PathfindingService.js';
import { Wall } from '../src/types.js';

describe('PathfindingService & BFS Golden Rule', () => {
  it('finds path on empty board', () => {
    const start = { row: 0, col: 4 };
    const hasPath = PathfindingService.hasPathToGoal(start, 8, []);
    expect(hasPath).toBe(true);

    const shortestPath = PathfindingService.findShortestPath(start, 8, []);
    expect(shortestPath).not.toBeNull();
    expect(shortestPath?.length).toBe(9);
  });

  it('navigates through labyrinth of walls', () => {
    // Staggered horizontal walls forcing slalom
    const walls: Wall[] = [
      { id: 'w1', anchor: { row: 1, col: 0 }, orientation: 'HORIZONTAL' },
      { id: 'w2', anchor: { row: 1, col: 2 }, orientation: 'HORIZONTAL' },
      { id: 'w3', anchor: { row: 1, col: 4 }, orientation: 'HORIZONTAL' },
      { id: 'w4', anchor: { row: 1, col: 6 }, orientation: 'HORIZONTAL' }, // gap at col 8
      { id: 'w5', anchor: { row: 3, col: 1 }, orientation: 'HORIZONTAL' }, // gap at col 0
      { id: 'w6', anchor: { row: 3, col: 3 }, orientation: 'HORIZONTAL' },
      { id: 'w7', anchor: { row: 3, col: 5 }, orientation: 'HORIZONTAL' },
      { id: 'w8', anchor: { row: 3, col: 7 }, orientation: 'HORIZONTAL' },
    ];

    const hasPath = PathfindingService.hasPathToGoal({ row: 0, col: 4 }, 8, walls);
    expect(hasPath).toBe(true);

    const path = PathfindingService.findShortestPath({ row: 0, col: 4 }, 8, walls);
    expect(path).not.toBeNull();
    expect(path?.[path.length - 1].row).toBe(8);
  });

  it('detects when player is completely boxed in', () => {
    // Enclose corner (0, 0)
    // Horizontal wall between (0,0) and (1,0) -> anchor (0, 0) H covers col 0 and 1
    // Vertical wall between col 0 and col 1 -> anchor (0, 0) V covers row 0 and 1
    const walls: Wall[] = [
      { id: 'w1', anchor: { row: 0, col: 0 }, orientation: 'HORIZONTAL' },
      { id: 'w2', anchor: { row: 0, col: 0 }, orientation: 'VERTICAL' },
    ];

    const hasPath = PathfindingService.hasPathToGoal({ row: 0, col: 0 }, 8, walls);
    expect(hasPath).toBe(false);
  });

  it('rejects candidate wall that blocks path to goal (Golden Rule)', () => {
    // 4 horizontal walls along row 0 covering columns 0 through 7
    const existingWalls: Wall[] = [
      { id: 'w1', anchor: { row: 0, col: 0 }, orientation: 'HORIZONTAL' },
      { id: 'w2', anchor: { row: 0, col: 2 }, orientation: 'HORIZONTAL' },
      { id: 'w3', anchor: { row: 0, col: 4 }, orientation: 'HORIZONTAL' },
      { id: 'w4', anchor: { row: 0, col: 6 }, orientation: 'HORIZONTAL' },
    ];

    const p1Pos = { row: 0, col: 4 };
    const p2Pos = { row: 8, col: 4 };

    // With gap to col 8 open, Player 1 can reach col 8 and descend to row 8
    expect(PathfindingService.hasPathToGoal(p1Pos, 8, existingWalls)).toBe(true);

    // Candidate vertical wall at (0, 7) blocks between col 7 and col 8, completely trapping Player 1 in row 0
    const blockingWall: Wall = { id: 'w_block', anchor: { row: 0, col: 7 }, orientation: 'VERTICAL' };

    const canPlace = PathfindingService.validateGoldenRule(blockingWall, existingWalls, p1Pos, p2Pos);
    expect(canPlace).toBe(false);
  });
});
