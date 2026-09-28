import { Application, Container, Rectangle } from 'pixi.js';
import { GameState, Position, WallOrientation, ValidationResult, PlayerId } from '@quoridor/core';
import { BOARD_TOTAL_SIZE, RENDER_CONFIG } from './constants.js';
import { BoardRenderer } from './board.renderer.js';
import { PawnRenderer } from './pawn.renderer.js';
import { WallRenderer } from './wall.renderer.js';

export class QuoridorView {
  private app!: Application;
  private stageContainer = new Container();

  public boardRenderer!: BoardRenderer;
  public pawnRenderer!: PawnRenderer;
  public wallRenderer!: WallRenderer;

  private currentLegalMoves: Position[] = [];

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

    const canvas = this.app.canvas as HTMLCanvasElement;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    canvas.style.aspectRatio = '1 / 1';
    canvas.style.cursor = 'default';
    containerElement.appendChild(canvas);

    this.app.stage.addChild(this.stageContainer);

    // Initialize layers
    this.boardRenderer = new BoardRenderer();
    this.wallRenderer = new WallRenderer();
    this.pawnRenderer = new PawnRenderer();

    this.stageContainer.addChild(this.boardRenderer.container);
    this.stageContainer.addChild(this.wallRenderer.container);
    this.stageContainer.addChild(this.pawnRenderer.container);

    // Provide validator to wall renderer
    this.wallRenderer.wallValidator = (anchor, orientation) =>
      this.wallValidator ? this.wallValidator(anchor, orientation) : { valid: true };

    // Make stage globally interactive
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = new Rectangle(0, 0, BOARD_TOTAL_SIZE, BOARD_TOTAL_SIZE);

    this.app.stage.on('pointermove', (event) => {
      const local = event.getLocalPosition(this.stageContainer);
      const isGrooveSnapped = this.wallRenderer.handlePointerMove(local.x, local.y);
      const isOverLegalMove = !!this.findLegalMoveAt(local.x, local.y);

      if (isOverLegalMove) {
        canvas.style.cursor = 'pointer';
      } else if (isGrooveSnapped && this.wallRenderer.isGhostValid()) {
        canvas.style.cursor = 'pointer';
      } else if (isGrooveSnapped) {
        canvas.style.cursor = 'not-allowed';
      } else {
        canvas.style.cursor = 'default';
      }
    });

    this.app.stage.on('pointerdown', (event) => {
      const local = event.getLocalPosition(this.stageContainer);

      // 1. Check if user clicked a legal move destination
      const move = this.findLegalMoveAt(local.x, local.y);
      if (move) {
        this.onMoveSelected?.(move);
        return;
      }

      // 2. Check if user clicked a legal groove intersection to place wall
      const anchor = this.wallRenderer.getHoveredAnchor();
      if (anchor && this.wallRenderer.isGhostValid()) {
        this.onWallPlaced?.({ ...anchor }, this.wallRenderer.getOrientation());
      }
    });

    this.app.stage.on('pointerleave', () => {
      this.wallRenderer.clearGhost();
      canvas.style.cursor = 'default';
    });

    // Ticker animation loop for pawns lerp
    this.app.ticker.add((ticker) => {
      this.pawnRenderer.update(ticker.deltaTime);
    });
  }

  private findLegalMoveAt(x: number, y: number): Position | null {
    for (const move of this.currentLegalMoves) {
      const tileX = RENDER_CONFIG.BOARD_PADDING + move.col * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE);
      const tileY = RENDER_CONFIG.BOARD_PADDING + move.row * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE);

      if (
        x >= tileX &&
        x <= tileX + RENDER_CONFIG.TILE_SIZE &&
        y >= tileY &&
        y <= tileY + RENDER_CONFIG.TILE_SIZE
      ) {
        return move;
      }
    }
    return null;
  }

  public updateState(state: GameState, legalMoves: Position[], myRole?: PlayerId | 'spectator') {
    this.currentLegalMoves = legalMoves;

    // 1. Update pawn positions
    this.pawnRenderer.setPositions(
      state.players.player1.position,
      state.players.player2.position
    );

    // 2. Update solid placed walls
    this.wallRenderer.renderWalls(state.walls);

    // 3. Update legal moves indicators
    const isMyTurn = !myRole || myRole === state.currentTurn;
    if (state.status === 'IN_PROGRESS' && isMyTurn) {
      this.boardRenderer.setLegalMoves(legalMoves, state.currentTurn);
    } else {
      this.boardRenderer.clearIndicators();
      this.currentLegalMoves = [];
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
