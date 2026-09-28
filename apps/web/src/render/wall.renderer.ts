import { Container, Graphics } from 'pixi.js';
import { Wall, WallOrientation, Position, ValidationResult } from '@quoridor/core';
import { RENDER_CONFIG } from './constants.js';

export class WallRenderer {
  public container = new Container();
  private placedWallsGfx = new Graphics();
  private ghostWallGfx = new Graphics();

  private orientation: WallOrientation = 'HORIZONTAL';
  private hoveredAnchor: Position | null = null;
  private isGhostLegal = false;

  public wallValidator?: (anchor: Position, orientation: WallOrientation) => ValidationResult;

  constructor() {
    this.container.addChild(this.placedWallsGfx);
    this.container.addChild(this.ghostWallGfx);
  }

  public setOrientation(orientation: WallOrientation) {
    this.orientation = orientation;
    this.updateGhostWall();
  }

  public toggleOrientation(): WallOrientation {
    this.orientation = this.orientation === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL';
    this.updateGhostWall();
    return this.orientation;
  }

  public getOrientation(): WallOrientation {
    return this.orientation;
  }

  public getHoveredAnchor(): Position | null {
    return this.hoveredAnchor;
  }

  public isGhostValid(): boolean {
    return this.isGhostLegal;
  }

  public renderWalls(walls: Wall[]) {
    this.placedWallsGfx.clear();

    for (const wall of walls) {
      const rect = this.getWallRect(wall.anchor, wall.orientation);

      // Subtle drop shadow
      this.placedWallsGfx
        .roundRect(rect.x, rect.y + 2, rect.width, rect.height, 4)
        .fill({ color: 0x000000, alpha: 0.5 });

      // Solid Amber Wall
      this.placedWallsGfx
        .roundRect(rect.x, rect.y, rect.width, rect.height, 4)
        .fill({ color: RENDER_CONFIG.COLORS.WALL_SOLID })
        .stroke({ width: 1.5, color: RENDER_CONFIG.COLORS.WALL_SOLID_BORDER });
    }
  }

  public getWallRect(anchor: Position, orientation: WallOrientation): { x: number; y: number; width: number; height: number } {
    const spanLength = 2 * RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE;
    const thickness = 10;
    const offset = (thickness - RENDER_CONFIG.GAP_SIZE) / 2; // 1px overhang

    if (orientation === 'HORIZONTAL') {
      const x = RENDER_CONFIG.BOARD_PADDING + anchor.col * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE);
      const y = RENDER_CONFIG.BOARD_PADDING + (anchor.row + 1) * RENDER_CONFIG.TILE_SIZE + anchor.row * RENDER_CONFIG.GAP_SIZE - offset;
      return { x, y, width: spanLength, height: thickness };
    } else {
      const x = RENDER_CONFIG.BOARD_PADDING + (anchor.col + 1) * RENDER_CONFIG.TILE_SIZE + anchor.col * RENDER_CONFIG.GAP_SIZE - offset;
      const y = RENDER_CONFIG.BOARD_PADDING + anchor.row * (RENDER_CONFIG.TILE_SIZE + RENDER_CONFIG.GAP_SIZE);
      return { x, y, width: thickness, height: spanLength };
    }
  }

  public handlePointerMove(x: number, y: number): boolean {
    const snap = this.findClosestGroove(x, y);

    if (snap) {
      if (!this.hoveredAnchor || this.hoveredAnchor.row !== snap.row || this.hoveredAnchor.col !== snap.col) {
        this.hoveredAnchor = snap;
        this.updateGhostWall();
      }
      return true;
    } else if (this.hoveredAnchor) {
      this.hoveredAnchor = null;
      this.ghostWallGfx.clear();
      return false;
    }
    return false;
  }

  public findClosestGroove(x: number, y: number): Position | null {
    const snapThreshold = 42; // Generous snapping threshold to easily catch grooves
    let closest: Position | null = null;
    let minDistanceSq = snapThreshold * snapThreshold;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cx =
          RENDER_CONFIG.BOARD_PADDING +
          (c + 1) * RENDER_CONFIG.TILE_SIZE +
          c * RENDER_CONFIG.GAP_SIZE +
          RENDER_CONFIG.GAP_SIZE / 2;
        const cy =
          RENDER_CONFIG.BOARD_PADDING +
          (r + 1) * RENDER_CONFIG.TILE_SIZE +
          r * RENDER_CONFIG.GAP_SIZE +
          RENDER_CONFIG.GAP_SIZE / 2;

        const dx = x - cx;
        const dy = y - cy;
        const dSq = dx * dx + dy * dy;

        if (dSq < minDistanceSq) {
          minDistanceSq = dSq;
          closest = { row: r, col: c };
        }
      }
    }

    return closest;
  }

  public updateGhostWall() {
    this.ghostWallGfx.clear();
    if (!this.hoveredAnchor) return;

    const validation = this.wallValidator
      ? this.wallValidator(this.hoveredAnchor, this.orientation)
      : { valid: true };

    this.isGhostLegal = validation.valid;
    const rect = this.getWallRect(this.hoveredAnchor, this.orientation);
    const color = this.isGhostLegal ? RENDER_CONFIG.COLORS.GHOST_LEGAL : RENDER_CONFIG.COLORS.GHOST_ILLEGAL;
    const alpha = this.isGhostLegal ? 0.65 : 0.7;

    // Glowing ghost wall outline and fill
    this.ghostWallGfx
      .roundRect(rect.x, rect.y, rect.width, rect.height, 4)
      .fill({ color, alpha })
      .stroke({ width: 2, color: this.isGhostLegal ? 0x00e5ff : 0xef4444, alpha: 0.95 });
  }

  public clearGhost() {
    this.hoveredAnchor = null;
    this.ghostWallGfx.clear();
  }
}
