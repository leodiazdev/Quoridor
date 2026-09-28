import { describe, it, expect } from 'vitest';
import { WallCollisionValidator } from '../src/validator/WallCollisionValidator.js';
import { Wall } from '../src/types.js';

describe('WallCollisionValidator', () => {
  it('validates boundaries properly', () => {
    expect(WallCollisionValidator.isWithinBounds({ row: 0, col: 0 })).toBe(true);
    expect(WallCollisionValidator.isWithinBounds({ row: 7, col: 7 })).toBe(true);
    expect(WallCollisionValidator.isWithinBounds({ row: -1, col: 0 })).toBe(false);
    expect(WallCollisionValidator.isWithinBounds({ row: 0, col: 8 })).toBe(false);
    expect(WallCollisionValidator.isWithinBounds({ row: 8, col: 0 })).toBe(false);
  });

  it('detects cross-cut intersections (+)', () => {
    const wallH: Wall = { id: 'w1', anchor: { row: 3, col: 3 }, orientation: 'HORIZONTAL' };
    const wallV: Wall = { id: 'w2', anchor: { row: 3, col: 3 }, orientation: 'VERTICAL' };
    expect(WallCollisionValidator.doWallsOverlap(wallH, wallV)).toBe(true);

    const wallV2: Wall = { id: 'w3', anchor: { row: 3, col: 4 }, orientation: 'VERTICAL' };
    expect(WallCollisionValidator.doWallsOverlap(wallH, wallV2)).toBe(false);
  });

  it('detects horizontal wall overlaps', () => {
    const wall1: Wall = { id: 'w1', anchor: { row: 2, col: 2 }, orientation: 'HORIZONTAL' };
    const wallSame: Wall = { id: 'w2', anchor: { row: 2, col: 2 }, orientation: 'HORIZONTAL' };
    const wallOverlapLeft: Wall = { id: 'w3', anchor: { row: 2, col: 1 }, orientation: 'HORIZONTAL' };
    const wallOverlapRight: Wall = { id: 'w4', anchor: { row: 2, col: 3 }, orientation: 'HORIZONTAL' };
    const wallNoOverlap: Wall = { id: 'w5', anchor: { row: 2, col: 4 }, orientation: 'HORIZONTAL' };
    const wallDiffRow: Wall = { id: 'w6', anchor: { row: 3, col: 2 }, orientation: 'HORIZONTAL' };

    expect(WallCollisionValidator.doWallsOverlap(wall1, wallSame)).toBe(true);
    expect(WallCollisionValidator.doWallsOverlap(wall1, wallOverlapLeft)).toBe(true);
    expect(WallCollisionValidator.doWallsOverlap(wall1, wallOverlapRight)).toBe(true);
    expect(WallCollisionValidator.doWallsOverlap(wall1, wallNoOverlap)).toBe(false);
    expect(WallCollisionValidator.doWallsOverlap(wall1, wallDiffRow)).toBe(false);
  });

  it('detects vertical wall overlaps', () => {
    const wall1: Wall = { id: 'w1', anchor: { row: 2, col: 2 }, orientation: 'VERTICAL' };
    const wallSame: Wall = { id: 'w2', anchor: { row: 2, col: 2 }, orientation: 'VERTICAL' };
    const wallOverlapUp: Wall = { id: 'w3', anchor: { row: 1, col: 2 }, orientation: 'VERTICAL' };
    const wallOverlapDown: Wall = { id: 'w4', anchor: { row: 3, col: 2 }, orientation: 'VERTICAL' };
    const wallNoOverlap: Wall = { id: 'w5', anchor: { row: 4, col: 2 }, orientation: 'VERTICAL' };
    const wallDiffCol: Wall = { id: 'w6', anchor: { row: 2, col: 3 }, orientation: 'VERTICAL' };

    expect(WallCollisionValidator.doWallsOverlap(wall1, wallSame)).toBe(true);
    expect(WallCollisionValidator.doWallsOverlap(wall1, wallOverlapUp)).toBe(true);
    expect(WallCollisionValidator.doWallsOverlap(wall1, wallOverlapDown)).toBe(true);
    expect(WallCollisionValidator.doWallsOverlap(wall1, wallNoOverlap)).toBe(false);
    expect(WallCollisionValidator.doWallsOverlap(wall1, wallDiffCol)).toBe(false);
  });

  it('blocks orthogonal pawn movements crossing horizontal wall', () => {
    // Horizontal wall at (0, 0) spans between row 0 and row 1 across col 0 and 1
    const walls: Wall[] = [{ id: 'w1', anchor: { row: 0, col: 0 }, orientation: 'HORIZONTAL' }];

    // Downward crossing
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 0, col: 0 }, { row: 1, col: 0 }, walls)).toBe(true);
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 0, col: 1 }, { row: 1, col: 1 }, walls)).toBe(true);
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 0, col: 2 }, { row: 1, col: 2 }, walls)).toBe(false);

    // Upward crossing
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 1, col: 0 }, { row: 0, col: 0 }, walls)).toBe(true);
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 1, col: 1 }, { row: 0, col: 1 }, walls)).toBe(true);
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 1, col: 2 }, { row: 0, col: 2 }, walls)).toBe(false);

    // Horizontal moves are not affected by this horizontal wall
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 0, col: 0 }, { row: 0, col: 1 }, walls)).toBe(false);
  });

  it('blocks orthogonal pawn movements crossing vertical wall', () => {
    // Vertical wall at (0, 0) spans between col 0 and col 1 across row 0 and 1
    const walls: Wall[] = [{ id: 'w1', anchor: { row: 0, col: 0 }, orientation: 'VERTICAL' }];

    // Rightward crossing
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 0, col: 0 }, { row: 0, col: 1 }, walls)).toBe(true);
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 1, col: 0 }, { row: 1, col: 1 }, walls)).toBe(true);
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 2, col: 0 }, { row: 2, col: 1 }, walls)).toBe(false);

    // Leftward crossing
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 0, col: 1 }, { row: 0, col: 0 }, walls)).toBe(true);
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 1, col: 1 }, { row: 1, col: 0 }, walls)).toBe(true);
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 2, col: 1 }, { row: 2, col: 0 }, walls)).toBe(false);

    // Vertical moves are not affected by this vertical wall
    expect(WallCollisionValidator.isMovementBlockedByWall({ row: 0, col: 0 }, { row: 1, col: 0 }, walls)).toBe(false);
  });
});
