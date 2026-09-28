import { describe, it, expect } from 'vitest';
import { PawnMovementValidator } from '../src/validator/PawnMovementValidator.js';
import { Wall } from '../src/types.js';

describe('PawnMovementValidator', () => {
  it('allows 4 orthogonal moves in open board', () => {
    const current = { row: 4, col: 4 };
    const opponent = { row: 0, col: 0 };
    const walls: Wall[] = [];

    const moves = PawnMovementValidator.getLegalMoves(current, opponent, walls);
    expect(moves).toHaveLength(4);
    expect(moves).toEqual(
      expect.arrayContaining([
        { row: 3, col: 4 },
        { row: 5, col: 4 },
        { row: 4, col: 3 },
        { row: 4, col: 5 },
      ])
    );
  });

  it('respects board boundaries (corners have only 2 moves)', () => {
    const current = { row: 0, col: 0 };
    const opponent = { row: 8, col: 8 };
    const moves = PawnMovementValidator.getLegalMoves(current, opponent, []);
    expect(moves).toHaveLength(2);
    expect(moves).toEqual(
      expect.arrayContaining([
        { row: 1, col: 0 },
        { row: 0, col: 1 },
      ])
    );
  });

  it('filters out moves blocked by walls', () => {
    const current = { row: 2, col: 2 };
    const opponent = { row: 8, col: 8 };
    // Horizontal wall below (between row 2 and 3)
    const walls: Wall[] = [{ id: 'w1', anchor: { row: 2, col: 2 }, orientation: 'HORIZONTAL' }];

    const moves = PawnMovementValidator.getLegalMoves(current, opponent, walls);
    // Move down to (3, 2) should be blocked
    expect(moves).not.toContainEqual({ row: 3, col: 2 });
    expect(moves).toContainEqual({ row: 1, col: 2 });
    expect(moves).toContainEqual({ row: 2, col: 1 });
    expect(moves).toContainEqual({ row: 2, col: 3 });
  });

  it('executes straight jump over adjacent opponent when unblocked', () => {
    const current = { row: 4, col: 4 };
    const opponent = { row: 3, col: 4 }; // Directly above
    const walls: Wall[] = [];

    const moves = PawnMovementValidator.getLegalMoves(current, opponent, walls);
    // Straight jump to (2, 4) must be present
    expect(moves).toContainEqual({ row: 2, col: 4 });
    // Opponent tile itself should NOT be a valid destination
    expect(moves).not.toContainEqual({ row: 3, col: 4 });
    // Other normal orthogonal moves
    expect(moves).toContainEqual({ row: 5, col: 4 }); // down
    expect(moves).toContainEqual({ row: 4, col: 3 }); // left
    expect(moves).toContainEqual({ row: 4, col: 5 }); // right
    // Diagonals must NOT be present because straight jump was unblocked
    expect(moves).not.toContainEqual({ row: 3, col: 3 });
    expect(moves).not.toContainEqual({ row: 3, col: 5 });
  });

  it('permits diagonal jumps when straight jump is blocked by board boundary', () => {
    const current = { row: 1, col: 4 };
    const opponent = { row: 0, col: 4 }; // Opponent is at edge row 0

    const moves = PawnMovementValidator.getLegalMoves(current, opponent, []);
    // Straight jump to (-1, 4) is out of bounds
    expect(moves).not.toContainEqual({ row: -1, col: 4 });
    // Diagonal jumps to (0, 3) and (0, 5) must be permitted!
    expect(moves).toContainEqual({ row: 0, col: 3 });
    expect(moves).toContainEqual({ row: 0, col: 5 });
  });

  it('permits diagonal jumps when straight jump is blocked by a wall behind opponent', () => {
    const current = { row: 4, col: 4 };
    const opponent = { row: 3, col: 4 };
    // Wall behind opponent: between row 2 and row 3 across col 4
    const walls: Wall[] = [{ id: 'w1', anchor: { row: 2, col: 4 }, orientation: 'HORIZONTAL' }];

    const moves = PawnMovementValidator.getLegalMoves(current, opponent, walls);
    // Straight jump to (2, 4) is blocked
    expect(moves).not.toContainEqual({ row: 2, col: 4 });
    // Diagonal jumps to (3, 3) and (3, 5) must be permitted
    expect(moves).toContainEqual({ row: 3, col: 3 });
    expect(moves).toContainEqual({ row: 3, col: 5 });
  });

  it('restricts diagonal jump if one diagonal side is also blocked by wall', () => {
    const current = { row: 4, col: 4 };
    const opponent = { row: 3, col: 4 };
    // Wall behind opponent
    const wallBehind: Wall = { id: 'w1', anchor: { row: 2, col: 4 }, orientation: 'HORIZONTAL' };
    // Vertical wall between col 4 and col 5 at row 3
    const wallRight: Wall = { id: 'w2', anchor: { row: 3, col: 4 }, orientation: 'VERTICAL' };

    const moves = PawnMovementValidator.getLegalMoves(current, opponent, [wallBehind, wallRight]);
    // Straight blocked
    expect(moves).not.toContainEqual({ row: 2, col: 4 });
    // Right diagonal blocked by vertical wall
    expect(moves).not.toContainEqual({ row: 3, col: 5 });
    // Left diagonal unblocked
    expect(moves).toContainEqual({ row: 3, col: 3 });
  });
});
