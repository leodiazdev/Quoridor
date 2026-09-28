import { Container, Graphics } from 'pixi.js';
import { Position, PlayerId } from '@quoridor/core';
import { RENDER_CONFIG } from './constants.js';

interface PawnToken {
  container: Container;
  graphics: Graphics;
  visualX: number;
  visualY: number;
  targetX: number;
  targetY: number;
  color: number;
  glowColor: number;
}

export class PawnRenderer {
  public container = new Container();
  private p1Token!: PawnToken;
  private p2Token!: PawnToken;

  constructor() {
    this.p1Token = this.createToken('player1', RENDER_CONFIG.COLORS.PLAYER_1, RENDER_CONFIG.COLORS.PLAYER_1_GLOW);
    this.p2Token = this.createToken('player2', RENDER_CONFIG.COLORS.PLAYER_2, RENDER_CONFIG.COLORS.PLAYER_2_GLOW);

    this.container.addChild(this.p1Token.container);
    this.container.addChild(this.p2Token.container);
  }

  private createToken(playerId: PlayerId, color: number, glowColor: number): PawnToken {
    const container = new Container();
    const graphics = new Graphics();
    container.addChild(graphics);

    // Initial draw
    this.drawTokenGraphics(graphics, color, glowColor, playerId === 'player1' ? '1' : '2');

    return {
      container,
      graphics,
      visualX: 0,
      visualY: 0,
      targetX: 0,
      targetY: 0,
      color,
      glowColor
    };
  }

  private drawTokenGraphics(gfx: Graphics, color: number, glowColor: number, _label: string) {
    gfx.clear();

    // 1. Soft Drop Shadow
    gfx
      .circle(0, 3, 17)
      .fill({ color: 0x000000, alpha: 0.45 });

    // 2. Outer Glow Ring
    gfx
      .circle(0, 0, 16.5)
      .fill({ color: glowColor, alpha: 0.35 });

    // 3. Main Token Body
    gfx
      .circle(0, 0, 15)
      .fill({ color })
      .stroke({ width: 2, color: 0xffffff, alpha: 0.9 });

    // 4. Concentric Inner Ring
    gfx
      .circle(0, 0, 9.5)
      .stroke({ width: 1.5, color: 0xffffff, alpha: 0.6 });

    // 5. Center Core Gem
    gfx
      .circle(0, 0, 4.5)
      .fill({ color: 0xffffff, alpha: 0.95 });
  }

  private getCellCenter(pos: Position): { x: number; y: number } {
    const x =
      RENDER_CONFIG.BOARD_PADDING +
      pos.col * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE) +
      RENDER_CONFIG.TILE_SIZE / 2;
    const y =
      RENDER_CONFIG.BOARD_PADDING +
      pos.row * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE) +
      RENDER_CONFIG.TILE_SIZE / 2;
    return { x, y };
  }

  public setPositions(p1Pos: Position, p2Pos: Position, immediate = false) {
    const p1Center = this.getCellCenter(p1Pos);
    this.p1Token.targetX = p1Center.x;
    this.p1Token.targetY = p1Center.y;

    const p2Center = this.getCellCenter(p2Pos);
    this.p2Token.targetX = p2Center.x;
    this.p2Token.targetY = p2Center.y;

    if (immediate) {
      this.p1Token.visualX = p1Center.x;
      this.p1Token.visualY = p1Center.y;
      this.p1Token.container.position.set(p1Center.x, p1Center.y);

      this.p2Token.visualX = p2Center.x;
      this.p2Token.visualY = p2Center.y;
      this.p2Token.container.position.set(p2Center.x, p2Center.y);
    }
  }

  public update(tickerDelta = 1) {
    // Smooth lerp positional transition (0.2 factor gives a snappy ~150ms slide)
    const factor = Math.min(1, 0.22 * tickerDelta);

    this.p1Token.visualX += (this.p1Token.targetX - this.p1Token.visualX) * factor;
    this.p1Token.visualY += (this.p1Token.targetY - this.p1Token.visualY) * factor;
    this.p1Token.container.position.set(this.p1Token.visualX, this.p1Token.visualY);

    this.p2Token.visualX += (this.p2Token.targetX - this.p2Token.visualX) * factor;
    this.p2Token.visualY += (this.p2Token.targetY - this.p2Token.visualY) * factor;
    this.p2Token.container.position.set(this.p2Token.visualX, this.p2Token.visualY);
  }
}
