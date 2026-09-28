import { Application, Container } from 'pixi.js';
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
  private activeMode: 'MOVE' | 'WALL' | 'AUTO' = 'AUTO';

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

    // Initialize renderer layers
    this.boardRenderer = new BoardRenderer();
    this.wallRenderer = new WallRenderer();
    this.pawnRenderer = new PawnRenderer();

    this.stageContainer.addChild(this.boardRenderer.container);
    this.stageContainer.addChild(this.wallRenderer.container);
    this.stageContainer.addChild(this.pawnRenderer.container);

    // Provide validator to wall renderer
    this.wallRenderer.wallValidator = (anchor, orientation) =>
      this.wallValidator ? this.wallValidator(anchor, orientation) : { valid: true };

    // Native DOM listeners directly on canvas guarantee 100% reliable tracking
    canvas.addEventListener('pointermove', (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = BOARD_TOTAL_SIZE / rect.width;
      const scaleY = BOARD_TOTAL_SIZE / rect.height;
      const localX = (e.clientX - rect.left) * scaleX;
      const localY = (e.clientY - rect.top) * scaleY;

      const isGrooveSnapped = this.wallRenderer.handlePointerMove(localX, localY);
      const isOverLegalMove = !!this.findLegalMoveAt(localX, localY);

      if (this.activeMode === 'WALL') {
        canvas.style.cursor = isGrooveSnapped && this.wallRenderer.isGhostValid() ? 'pointer' : (isGrooveSnapped ? 'not-allowed' : 'crosshair');
      } else if (isOverLegalMove) {
        canvas.style.cursor = 'pointer';
      } else if (isGrooveSnapped && this.wallRenderer.isGhostValid()) {
        canvas.style.cursor = 'pointer';
      } else if (isGrooveSnapped) {
        canvas.style.cursor = 'not-allowed';
      } else {
        canvas.style.cursor = 'default';
      }
    });

    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = BOARD_TOTAL_SIZE / rect.width;
      const scaleY = BOARD_TOTAL_SIZE / rect.height;
      const localX = (e.clientX - rect.left) * scaleX;
      const localY = (e.clientY - rect.top) * scaleY;

      if (this.activeMode === 'WALL') {
        const anchor = this.wallRenderer.getHoveredAnchor();
        if (anchor && this.wallRenderer.isGhostValid()) {
          this.onWallPlaced?.({ ...anchor }, this.wallRenderer.getOrientation());
          return;
        }
      }

      // Check move disc click
      const move = this.findLegalMoveAt(localX, localY);
      if (move) {
        this.onMoveSelected?.(move);
        return;
      }

      // Check groove click
      const anchor = this.wallRenderer.getHoveredAnchor();
      if (anchor && this.wallRenderer.isGhostValid()) {
        this.onWallPlaced?.({ ...anchor }, this.wallRenderer.getOrientation());
      }
    });

    canvas.addEventListener('pointerleave', () => {
      this.wallRenderer.clearGhost();
      canvas.style.cursor = 'default';
    });

    // Ticker animation loop for pawns lerp
    this.app.ticker.add((ticker) => {
      this.pawnRenderer.update(ticker.deltaTime);
    });
  }

  public setInteractionMode(mode: 'MOVE' | 'WALL') {
    this.activeMode = mode;
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
