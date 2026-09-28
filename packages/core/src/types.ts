export type WallOrientation = 'HORIZONTAL' | 'VERTICAL';

export type PlayerId = 'player1' | 'player2';

export interface Position {
  row: number;
  col: number;
}

export interface Wall {
  id: string;
  anchor: Position;
  orientation: WallOrientation;
  placedBy?: PlayerId;
}

export interface PlayerState {
  id: PlayerId;
  position: Position;
  wallsLeft: number;
  targetRow: number;
}

export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';

export interface GameMovePawnAction {
  type: 'MOVE_PAWN';
  playerId: PlayerId;
  position: Position;
  timestamp?: number;
}

export interface GamePlaceWallAction {
  type: 'PLACE_WALL';
  playerId: PlayerId;
  anchor: Position;
  orientation: WallOrientation;
  timestamp?: number;
}

export type GameAction = GameMovePawnAction | GamePlaceWallAction;

export interface GameState {
  id: string;
  status: GameStatus;
  currentTurn: PlayerId;
  players: Record<PlayerId, PlayerState>;
  walls: Wall[];
  winner: PlayerId | null;
  history: GameAction[];
  turnStartTime?: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}
