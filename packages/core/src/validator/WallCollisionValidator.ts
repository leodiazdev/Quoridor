import { Position, Wall, WallOrientation, ValidationResult } from '../types.js';
import { WALL_GRID_SIZE } from '../constants.js';

export class WallCollisionValidator {
  /**
   * Checks if wall anchor is within board bounds (0..7 for both row and col).
   */
  public static isWithinBounds(anchor: Position): boolean {
    return (
      Number.isInteger(anchor.row) &&
      Number.isInteger(anchor.col) &&
      anchor.row >= 0 &&
      anchor.row < WALL_GRID_SIZE &&
      anchor.col >= 0 &&
      anchor.col < WALL_GRID_SIZE
    );
  }

  /**
   * Checks whether two walls physically intersect or overlap.
   */
  public static doWallsOverlap(wall1: { anchor: Position; orientation: WallOrientation }, wall2: { anchor: Position; orientation: WallOrientation }): boolean {
    // 1. Cross intersection (+): one horizontal, one vertical at the exact same anchor
    if (wall1.orientation !== wall2.orientation) {
      return wall1.anchor.row === wall2.anchor.row && wall1.anchor.col === wall2.anchor.col;
    }

    // 2. Both Horizontal: same row, and column distance < 2 (shares at least 1 cell edge)
    if (wall1.orientation === 'HORIZONTAL' && wall2.orientation === 'HORIZONTAL') {
      return (
        wall1.anchor.row === wall2.anchor.row &&
        Math.abs(wall1.anchor.col - wall2.anchor.col) < 2
      );
    }

    // 3. Both Vertical: same col, and row distance < 2 (shares at least 1 cell edge)
    if (wall1.orientation === 'VERTICAL' && wall2.orientation === 'VERTICAL') {
      return (
        wall1.anchor.col === wall2.anchor.col &&
        Math.abs(wall1.anchor.row - wall2.anchor.row) < 2
      );
    }

    return false;
  }

  /**
   * Validates if a proposed wall conflicts with bounds or existing placed walls.
   */
  public static validateWallPlacement(
    candidate: { anchor: Position; orientation: WallOrientation },
    existingWalls: Wall[]
  ): ValidationResult {
    if (!this.isWithinBounds(candidate.anchor)) {
      return {
        valid: false,
        reason: `Wall anchor (${candidate.anchor.row}, ${candidate.anchor.col}) is out of bounds [0..${WALL_GRID_SIZE - 1}].`
      };
    }

    for (const wall of existingWalls) {
      if (this.doWallsOverlap(candidate, wall)) {
        return {
          valid: false,
          reason: `Wall overlaps or intersects with existing wall at (${wall.anchor.row}, ${wall.anchor.col}, ${wall.orientation}).`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Checks if an orthogonal 1-step move from `from` to `to` is blocked by any wall.
   */
  public static isMovementBlockedByWall(from: Position, to: Position, walls: Wall[]): boolean {
    const dRow = to.row - from.row;
    const dCol = to.col - from.col;

    // Movement must be adjacent orthogonal
    if (Math.abs(dRow) + Math.abs(dCol) !== 1) {
      return true;
    }

    for (const wall of walls) {
      if (dRow === -1 && dCol === 0) {
        // Moving UP (from r to r-1)
        // Blocked by horizontal wall at (r-1, c) or (r-1, c-1)
        if (
          wall.orientation === 'HORIZONTAL' &&
          wall.anchor.row === from.row - 1 &&
          (wall.anchor.col === from.col || wall.anchor.col === from.col - 1)
        ) {
          return true;
        }
      } else if (dRow === 1 && dCol === 0) {
        // Moving DOWN (from r to r+1)
        // Blocked by horizontal wall at (r, c) or (r, c-1)
        if (
          wall.orientation === 'HORIZONTAL' &&
          wall.anchor.row === from.row &&
          (wall.anchor.col === from.col || wall.anchor.col === from.col - 1)
        ) {
          return true;
        }
      } else if (dRow === 0 && dCol === -1) {
        // Moving LEFT (from c to c-1)
        // Blocked by vertical wall at (r, c-1) or (r-1, c-1)
        if (
          wall.orientation === 'VERTICAL' &&
          wall.anchor.col === from.col - 1 &&
          (wall.anchor.row === from.row || wall.anchor.row === from.row - 1)
        ) {
          return true;
        }
      } else if (dRow === 0 && dCol === 1) {
        // Moving RIGHT (from c to c+1)
        // Blocked by vertical wall at (r, c) or (r-1, c)
        if (
          wall.orientation === 'VERTICAL' &&
          wall.anchor.col === from.col &&
          (wall.anchor.row === from.row || wall.anchor.row === from.row - 1)
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
