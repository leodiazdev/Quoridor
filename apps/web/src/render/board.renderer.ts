import { Container, Graphics } from 'pixi.js';
import { Position, PlayerId } from '@quoridor/core';
import { RENDER_CONFIG, BOARD_TOTAL_SIZE, TOTAL_GRID_SIZE } from './constants.js';

export class BoardRenderer {
  public container = new Container();
  private backgroundGfx = new Graphics();
  private tilesGfx = new Graphics();
  private indicatorsContainer = new Container();

  public onMoveSelected?: (pos: Position) => void;

  constructor() {
    this.container.addChild(this.backgroundGfx);
    this.container.addChild(this.tilesGfx);
    this.container.addChild(this.indicatorsContainer);

    this.drawBoard();
  }

  private drawBoard() {
    // 1. Board Background
    this.backgroundGfx.clear();
    this.backgroundGfx
      .roundRect(0, 0, BOARD_TOTAL_SIZE, BOARD_TOTAL_SIZE, 12)
      .fill({ color: RENDER_CONFIG.COLORS.BOARD_BG })
      .stroke({ width: 2, color: RENDER_CONFIG.COLORS.BOARD_BORDER });

    // Inner subtle shadow / groove plate
    this.backgroundGfx
      .roundRect(
        RENDER_CONFIG.BOARD_PADDING - 4,
        RENDER_CONFIG.BOARD_PADDING - 4,
        TOTAL_GRID_SIZE + 8,
        TOTAL_GRID_SIZE + 8,
        8
      )
      .fill({ color: RENDER_CONFIG.COLORS.GROOVE_BG });

    // 2. 81 Tiles
    this.tilesGfx.clear();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const x = RENDER_CONFIG.BOARD_PADDING + c * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE);
        const y = RENDER_CONFIG.BOARD_PADDING + r * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE);

        this.tilesGfx
          .roundRect(x, y, RENDER_CONFIG.TILE_SIZE, RENDER_CONFIG.TILE_SIZE, RENDER_CONFIG.TILE_CORNER_RADIUS)
          .fill({ color: RENDER_CONFIG.COLORS.TILE_NORMAL });
      }
    }
  }

  public setLegalMoves(moves: Position[], currentTurn: PlayerId) {
    this.indicatorsContainer.removeChildren();

    const indicatorColor =
      currentTurn === 'player1'
        ? RENDER_CONFIG.COLORS.PLAYER_1
        : RENDER_CONFIG.COLORS.PLAYER_2;

    for (const move of moves) {
      const tileX = RENDER_CONFIG.BOARD_PADDING + move.col * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE);
      const tileY = RENDER_CONFIG.BOARD_PADDING + move.row * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE);
      const centerX = tileX + RENDER_CONFIG.TILE_SIZE / 2;
      const centerY = tileY + RENDER_CONFIG.TILE_SIZE / 2;

      const indicator = new Graphics();
      indicator.eventMode = 'static';
      indicator.cursor = 'pointer';

      // Outer glow disc
      indicator
        .circle(centerX, centerY, 14)
        .fill({ color: indicatorColor, alpha: 0.25 });

      // Core pulsating disc
      indicator
        .circle(centerX, centerY, 7)
        .fill({ color: indicatorColor, alpha: 0.9 })
        .stroke({ width: 1.5, color: 0xffffff, alpha: 0.8 });

      // Hover effect
      indicator.on('pointerover', () => {
        indicator.clear();
        indicator
          .circle(centerX, centerY, 18)
          .fill({ color: indicatorColor, alpha: 0.4 })
          .circle(centerX, centerY, 9)
          .fill({ color: 0xffffff, alpha: 0.95 });
      });

      indicator.on('pointerout', () => {
        indicator.clear();
        indicator
          .circle(centerX, centerY, 14)
          .fill({ color: indicatorColor, alpha: 0.25 })
          .circle(centerX, centerY, 7)
          .fill({ color: indicatorColor, alpha: 0.9 })
          .stroke({ width: 1.5, color: 0xffffff, alpha: 0.8 });
      });

      indicator.on('pointerdown', (e) => {
        e.stopPropagation();
        this.onMoveSelected?.(move);
      });

      this.indicatorsContainer.addChild(indicator);
    }
  }

  public clearIndicators() {
    this.indicatorsContainer.removeChildren();
  }
}
