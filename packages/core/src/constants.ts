import { Position } from './types.js';

export const BOARD_SIZE = 9;
export const WALL_GRID_SIZE = 8; // Anchors are 0..7
export const WALLS_PER_PLAYER = 10;

export const PLAYER1_START_POS: Position = { row: 0, col: 4 };
export const PLAYER2_START_POS: Position = { row: 8, col: 4 };

export const PLAYER1_TARGET_ROW = 8;
export const PLAYER2_TARGET_ROW = 0;
