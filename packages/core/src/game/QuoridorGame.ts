import {
  GameState,
  PlayerId,
  Position,
  Wall,
  WallOrientation,
  GameAction,
  ValidationResult
} from '../types.js';
import {
  WALLS_PER_PLAYER,
  PLAYER1_START_POS,
  PLAYER2_START_POS,
  PLAYER1_TARGET_ROW,
  PLAYER2_TARGET_ROW
} from '../constants.js';
import { WallCollisionValidator } from '../validator/WallCollisionValidator.js';
import { PawnMovementValidator } from '../validator/PawnMovementValidator.js';
import { PathfindingService } from '../pathfinding/PathfindingService.js';

export class QuoridorGame {
  private state: GameState;

  constructor(initialState?: Partial<GameState>) {
    this.state = {
      id: initialState?.id ?? `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: initialState?.status ?? 'IN_PROGRESS',
      currentTurn: initialState?.currentTurn ?? 'player1',
      players: initialState?.players ?? {
        player1: {
          id: 'player1',
          position: { ...PLAYER1_START_POS },
          wallsLeft: WALLS_PER_PLAYER,
          targetRow: PLAYER1_TARGET_ROW
        },
        player2: {
          id: 'player2',
          position: { ...PLAYER2_START_POS },
          wallsLeft: WALLS_PER_PLAYER,
          targetRow: PLAYER2_TARGET_ROW
        }
      },
      walls: initialState?.walls ? initialState.walls.map((w) => ({ ...w, anchor: { ...w.anchor } })) : [],
      winner: initialState?.winner ?? null,
      history: initialState?.history ? [...initialState.history] : [],
      turnStartTime: initialState?.turnStartTime ?? Date.now()
    };
  }

  public static create(id?: string): QuoridorGame {
    return new QuoridorGame({ id });
  }

  public getState(): Readonly<GameState> {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getOpponentId(playerId: PlayerId): PlayerId {
    return playerId === 'player1' ? 'player2' : 'player1';
  }

  public getLegalMoves(playerId: PlayerId = this.state.currentTurn): Position[] {
    if (this.state.status === 'FINISHED') {
      return [];
    }
    const player = this.state.players[playerId];
    const opponent = this.state.players[this.getOpponentId(playerId)];
    return PawnMovementValidator.getLegalMoves(player.position, opponent.position, this.state.walls);
  }

  public validateMovePawn(playerId: PlayerId, target: Position): ValidationResult {
    if (this.state.status !== 'IN_PROGRESS') {
      return { valid: false, reason: 'Game is not in progress.' };
    }
    if (this.state.currentTurn !== playerId) {
      return { valid: false, reason: `It is not ${playerId}'s turn.` };
    }
    const player = this.state.players[playerId];
    const opponent = this.state.players[this.getOpponentId(playerId)];

    const isLegal = PawnMovementValidator.isLegalMove(player.position, target, opponent.position, this.state.walls);
    if (!isLegal) {
      return { valid: false, reason: `Move to (${target.row}, ${target.col}) is illegal.` };
    }
    return { valid: true };
  }

  public movePawn(playerId: PlayerId, target: Position): GameState {
    const validation = this.validateMovePawn(playerId, target);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const player = this.state.players[playerId];
    player.position = { ...target };

    const action: GameAction = {
      type: 'MOVE_PAWN',
      playerId,
      position: { ...target },
      timestamp: Date.now()
    };
    this.state.history.push(action);

    // Check Win Condition
    if (player.position.row === player.targetRow) {
      this.state.winner = playerId;
      this.state.status = 'FINISHED';
    } else {
      this.state.currentTurn = this.getOpponentId(playerId);
      this.state.turnStartTime = Date.now();
    }

    return this.getState();
  }

  public validatePlaceWall(playerId: PlayerId, anchor: Position, orientation: WallOrientation): ValidationResult {
    if (this.state.status !== 'IN_PROGRESS') {
      return { valid: false, reason: 'Game is not in progress.' };
    }
    if (this.state.currentTurn !== playerId) {
      return { valid: false, reason: `It is not ${playerId}'s turn.` };
    }

    const player = this.state.players[playerId];
    if (player.wallsLeft <= 0) {
      return { valid: false, reason: 'No walls remaining for player.' };
    }

    const candidateWall: Wall = {
      id: `wall_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      anchor: { ...anchor },
      orientation,
      placedBy: playerId
    };

    const collisionResult = WallCollisionValidator.validateWallPlacement(candidateWall, this.state.walls);
    if (!collisionResult.valid) {
      return collisionResult;
    }

    // Pathfinding Golden Rule check
    const p1Pos = this.state.players.player1.position;
    const p2Pos = this.state.players.player2.position;
    const goldenRuleOk = PathfindingService.validateGoldenRule(candidateWall, this.state.walls, p1Pos, p2Pos);
    if (!goldenRuleOk) {
      return {
        valid: false,
        reason: 'Illegal wall placement: completely blocks path to goal for at least one player.'
      };
    }

    return { valid: true };
  }

  public placeWall(playerId: PlayerId, anchor: Position, orientation: WallOrientation): GameState {
    const validation = this.validatePlaceWall(playerId, anchor, orientation);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const player = this.state.players[playerId];
    player.wallsLeft -= 1;

    const newWall: Wall = {
      id: `wall_${this.state.walls.length + 1}_${playerId}`,
      anchor: { ...anchor },
      orientation,
      placedBy: playerId
    };

    this.state.walls.push(newWall);

    const action: GameAction = {
      type: 'PLACE_WALL',
      playerId,
      anchor: { ...anchor },
      orientation,
      timestamp: Date.now()
    };
    this.state.history.push(action);

    this.state.currentTurn = this.getOpponentId(playerId);
    this.state.turnStartTime = Date.now();

    return this.getState();
  }

  public executeAction(action: GameAction): GameState {
    if (action.type === 'MOVE_PAWN') {
      return this.movePawn(action.playerId, action.position);
    } else if (action.type === 'PLACE_WALL') {
      return this.placeWall(action.playerId, action.anchor, action.orientation);
    }
    throw new Error('Unsupported game action.');
  }

  public clone(): QuoridorGame {
    return new QuoridorGame(this.getState());
  }
}
