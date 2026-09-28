export const RENDER_CONFIG = {
  TILE_SIZE: 50,
  GAP_SIZE: 8,
  BOARD_PADDING: 20,
  TILE_CORNER_RADIUS: 4,
  WALL_CORNER_RADIUS: 3,

  COLORS: {
    BOARD_BG: 0x0F172A,       // Deep Slate
    BOARD_BORDER: 0x1E293B,   // Charcoal border
    TILE_NORMAL: 0x1E293B,    // Smooth Charcoal
    TILE_HOVER: 0x334155,     // Slate Blue
    GROOVE_BG: 0x090D16,      // Dark groove base

    PLAYER_1: 0x00E5FF,       // Electric Cyan
    PLAYER_1_ACCENT: 0x00B0FF,
    PLAYER_1_GLOW: 0x00E5FF,

    PLAYER_2: 0xFF5252,       // Radiant Coral
    PLAYER_2_ACCENT: 0xD50000,
    PLAYER_2_GLOW: 0xFF5252,

    WALL_SOLID: 0xF59E0B,     // Warm Sandstone / Amber
    WALL_SOLID_BORDER: 0xD97706,

    GHOST_LEGAL: 0x00E5FF,    // Translucent Cyan
    GHOST_ILLEGAL: 0xEF4444,  // Translucent Red
    
    MOVE_INDICATOR: 0x00E5FF,
    MOVE_INDICATOR_HOVER: 0x38BDF8,
  }
};

// Derived measurements
export const TOTAL_GRID_SIZE = 9 * RENDER_CONFIG.TILE_SIZE + 8 * RENDER_CONFIG.GAP_SIZE; // 450 + 64 = 514
export const BOARD_TOTAL_SIZE = TOTAL_GRID_SIZE + 2 * RENDER_CONFIG.BOARD_PADDING; // 554
