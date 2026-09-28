import { Position, Wall } from '../types.js';
import { BOARD_SIZE, PLAYER1_TARGET_ROW, PLAYER2_TARGET_ROW } from '../constants.js';
import { WallCollisionValidator } from '../validator/WallCollisionValidator.js';

export class PathfindingService {
  private static readonly DIRECTIONS: readonly Position[] = [
    { row: -1, col: 0 }, // UP
    { row: 1, col: 0 },  // DOWN
    { row: 0, col: -1 }, // LEFT
    { row: 0, col: 1 },  // RIGHT
  ];

  /**
   * Fast BFS to check if there is an unblocked path from `start` to any cell in `targetRow`.
   */
  public static hasPathToGoal(start: Position, targetRow: number, walls: Wall[]): boolean {
    if (start.row === targetRow) {
      return true;
    }

    // 81-bit or boolean array for visited: index = row * 9 + col
    const visited = new Uint8Array(BOARD_SIZE * BOARD_SIZE);
    const queue: Position[] = [start];
    visited[start.row * BOARD_SIZE + start.col] = 1;

    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];

      for (const dir of this.DIRECTIONS) {
        const nextRow = current.row + dir.row;
        const nextCol = current.col + dir.col;

        // Board boundary check
        if (nextRow < 0 || nextRow >= BOARD_SIZE || nextCol < 0 || nextCol >= BOARD_SIZE) {
          continue;
        }

        const nextIndex = nextRow * BOARD_SIZE + nextCol;
        if (visited[nextIndex] === 1) {
          continue;
        }

        const nextPos: Position = { row: nextRow, col: nextCol };

        // Wall obstruction check
        if (WallCollisionValidator.isMovementBlockedByWall(current, nextPos, walls)) {
          continue;
        }

        // Check if reached target row
        if (nextRow === targetRow) {
          return true;
        }

        visited[nextIndex] = 1;
        queue.push(nextPos);
      }
    }

    return false;
  }

  /**
   * Returns the shortest path from `start` to `targetRow` as an array of Positions, or null if unreachable.
   */
  public static findShortestPath(start: Position, targetRow: number, walls: Wall[]): Position[] | null {
    if (start.row === targetRow) {
      return [start];
    }

    const visited = new Uint8Array(BOARD_SIZE * BOARD_SIZE);
    const parent = new Int16Array(BOARD_SIZE * BOARD_SIZE).fill(-1);
    const queue: Position[] = [start];
    const startIndex = start.row * BOARD_SIZE + start.col;
    visited[startIndex] = 1;

    let head = 0;
    let goalIndex = -1;

    while (head < queue.length) {
      const current = queue[head++];
      const currentIndex = current.row * BOARD_SIZE + current.col;

      if (current.row === targetRow) {
        goalIndex = currentIndex;
        break;
      }

      for (const dir of this.DIRECTIONS) {
        const nextRow = current.row + dir.row;
        const nextCol = current.col + dir.col;

        if (nextRow < 0 || nextRow >= BOARD_SIZE || nextCol < 0 || nextCol >= BOARD_SIZE) {
          continue;
        }

        const nextIndex = nextRow * BOARD_SIZE + nextCol;
        if (visited[nextIndex] === 1) {
          continue;
        }

        const nextPos: Position = { row: nextRow, col: nextCol };
        if (WallCollisionValidator.isMovementBlockedByWall(current, nextPos, walls)) {
          continue;
        }

        visited[nextIndex] = 1;
        parent[nextIndex] = currentIndex;
        queue.push(nextPos);
      }
    }

    if (goalIndex === -1) {
      return null;
    }

    // Reconstruct path
    const path: Position[] = [];
    let curr = goalIndex;
    while (curr !== -1) {
      path.push({
        row: Math.floor(curr / BOARD_SIZE),
        col: curr % BOARD_SIZE
      });
      if (curr === startIndex) break;
      curr = parent[curr];
    }

    return path.reverse();
  }

  /**
   * Validates the Golden Rule: Placing `candidateWall` must NOT trap either player.
   */
  public static validateGoldenRule(
    candidateWall: Wall,
    existingWalls: Wall[],
    player1Pos: Position,
    player2Pos: Position
  ): boolean {
    const simulatedWalls = [...existingWalls, candidateWall];

    const p1HasPath = this.hasPathToGoal(player1Pos, PLAYER1_TARGET_ROW, simulatedWalls);
    if (!p1HasPath) return false;

    const p2HasPath = this.hasPathToGoal(player2Pos, PLAYER2_TARGET_ROW, simulatedWalls);
    return p2HasPath;
  }
}
