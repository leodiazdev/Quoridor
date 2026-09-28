import { Position, Wall } from '../types.js';
import { BOARD_SIZE } from '../constants.js';
import { WallCollisionValidator } from './WallCollisionValidator.js';

export class PawnMovementValidator {
  private static readonly ORTHOGONAL_DIRECTIONS: readonly Position[] = [
    { row: -1, col: 0 }, // UP
    { row: 1, col: 0 },  // DOWN
    { row: 0, col: -1 }, // LEFT
    { row: 0, col: 1 },  // RIGHT
  ];

  public static isWithinBounds(pos: Position): boolean {
    return (
      Number.isInteger(pos.row) &&
      Number.isInteger(pos.col) &&
      pos.row >= 0 &&
      pos.row < BOARD_SIZE &&
      pos.col >= 0 &&
      pos.col < BOARD_SIZE
    );
  }

  public static arePositionsEqual(a: Position, b: Position): boolean {
    return a.row === b.row && a.col === b.col;
  }

  /**
   * Computes all legal moves for a pawn at `currentPos`, considering `opponentPos` and placed `walls`.
   */
  public static getLegalMoves(
    currentPos: Position,
    opponentPos: Position,
    walls: Wall[]
  ): Position[] {
    const legalMoves: Position[] = [];

    for (const dir of this.ORTHOGONAL_DIRECTIONS) {
      const neighbor: Position = {
        row: currentPos.row + dir.row,
        col: currentPos.col + dir.col
      };

      // 1. Must be on board
      if (!this.isWithinBounds(neighbor)) {
        continue;
      }

      // 2. Path between current and neighbor must not be blocked by wall
      if (WallCollisionValidator.isMovementBlockedByWall(currentPos, neighbor, walls)) {
        continue;
      }

      // 3. If neighbor is NOT occupied by opponent, it's a legal 1-step move
      if (!this.arePositionsEqual(neighbor, opponentPos)) {
        legalMoves.push(neighbor);
        continue;
      }

      // 4. Neighbor IS occupied by opponent -> Jump logic
      const straightJump: Position = {
        row: opponentPos.row + dir.row,
        col: opponentPos.col + dir.col
      };

      const straightInBounds = this.isWithinBounds(straightJump);
      const straightBlockedByWall = straightInBounds && WallCollisionValidator.isMovementBlockedByWall(opponentPos, straightJump, walls);

      if (straightInBounds && !straightBlockedByWall) {
        // Straight jump is possible and mandatory over diagonals in this direction
        legalMoves.push(straightJump);
      } else {
        // Straight jump is blocked by board edge or wall -> Diagonal jumps permitted
        const perpDirections: Position[] =
          dir.row !== 0
            ? [{ row: 0, col: -1 }, { row: 0, col: 1 }] // if vertical, check left/right
            : [{ row: -1, col: 0 }, { row: 1, col: 0 }]; // if horizontal, check up/down

        for (const perp of perpDirections) {
          const diagonalPos: Position = {
            row: opponentPos.row + perp.row,
            col: opponentPos.col + perp.col
          };

          if (
            this.isWithinBounds(diagonalPos) &&
            !WallCollisionValidator.isMovementBlockedByWall(opponentPos, diagonalPos, walls)
          ) {
            legalMoves.push(diagonalPos);
          }
        }
      }
    }

    return legalMoves;
  }

  /**
   * Validates if a target move is legal.
   */
  public static isLegalMove(
    from: Position,
    to: Position,
    opponentPos: Position,
    walls: Wall[]
  ): boolean {
    const validMoves = this.getLegalMoves(from, opponentPos, walls);
    return validMoves.some((m) => this.arePositionsEqual(m, to));
  }
}
