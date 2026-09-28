import { Application, Container } from 'pixi.js';
import { GameState, Position, WallOrientation, ValidationResult, PlayerId } from '@quoridor/core';
import { BOARD_TOTAL_SIZE } from './constants.js';
import { BoardRenderer } from './board.renderer.js';
import { PawnRenderer } from './pawn.renderer.js';
import { WallRenderer } from './wall.renderer.js';

export class QuoridorView {
  private app!: Application;
  private stageContainer = new Container();

  public boardRenderer!: BoardRenderer;
  public pawnRenderer!: PawnRenderer;
  public wallRenderer!: WallRenderer;

  public onMoveSelected?: (pos: Position) => void;
  public onWallPlaced?: (anchor: Position, orientation: WallOrientation) => void;
  public wallValidator?: (anchor: Position, orientation: WallOrientation) => ValidationResult;

  public async init(containerElement: HTMLElement): Promise<void> {
    this.app = new Application();
    await this.app.init({
      width: BOARD_TOTAL_SIZE,
      height: BOARD_TOTAL_SIZE,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Make canvas responsive with CSS max-width
    const canvas = this.app.canvas as HTMLCanvasElement;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    canvas.style.aspectRatio = '1 / 1';
    containerElement.appendChild(canvas);

    this.app.stage.addChild(this.stageContainer);

    // Instantiate renderers in layer hierarchy
    this.boardRenderer = new BoardRenderer();
    this.wallRenderer = new WallRenderer();
    this.pawnRenderer = new PawnRenderer();

    this.stageContainer.addChild(this.boardRenderer.container);
    this.stageContainer.addChild(this.wallRenderer.container);
    this.stageContainer.addChild(this.pawnRenderer.container);

    // Wire up events
    this.boardRenderer.onMoveSelected = (pos) => this.onMoveSelected?.(pos);
    this.wallRenderer.onWallPlaced = (anchor, orientation) => this.onWallPlaced?.(anchor, orientation);
    this.wallRenderer.wallValidator = (anchor, orientation) =>
      this.wallValidator ? this.wallValidator(anchor, orientation) : { valid: true };

    // Ticker animation loop for pawns
    this.app.ticker.add((ticker) => {
      this.pawnRenderer.update(ticker.deltaTime);
    });
  }

  public updateState(state: GameState, legalMoves: Position[], myRole?: PlayerId | 'spectator') {
    // 1. Update pawns
    this.pawnRenderer.setPositions(
      state.players.player1.position,
      state.players.player2.position
    );

    // 2. Update placed walls
    this.wallRenderer.renderWalls(state.walls);

    // 3. Update legal moves indicators if it's current player's turn or offline play
    const isMyTurn = !myRole || myRole === state.currentTurn;
    if (state.status === 'IN_PROGRESS' && isMyTurn) {
      this.boardRenderer.setLegalMoves(legalMoves, state.currentTurn);
    } else {
      this.boardRenderer.clearIndicators();
    }

    this.wallRenderer.updateGhostWall();
  }

  public toggleOrientation(): WallOrientation {
    return this.wallRenderer.toggleOrientation();
  }

  public getOrientation(): WallOrientation {
    return this.wallRenderer.getOrientation();
  }

  public destroy() {
    this.app.destroy(true, { children: true });
  }
}
