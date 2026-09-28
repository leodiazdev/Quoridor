# Antigravity / Gemini Agent Task: Quoridor Real-Time Engine & Client
## Authoritative Server, Real-Time BFS Validation & Procedural PixiJS UI

You are acting as a Senior Game Engine & Distributed Systems Engineer. Your mission is to build **Quoridor**, an authoritative real-time 1v1 multiplayer web adaptation of the classic abstract board game, featuring:
- **Zero-Dependency Domain Core** with real-time Breadth-First Search (BFS) pathfinding.
- **Authoritative Server Pattern** over WebSockets (NestJS + Socket.io).
- **100% Procedural Graphics** rendered via HTML5 Canvas using PixiJS v8+ (no external PNG/JPG textures required).
- **Autonomous Git lifecycle management** across isolated feature branches.

---

## 0. Git Protocol & Autonomous Branch Management (Mandatory)

The local Git repository is already initialized (`git init` is done). Do NOT run `git init`.

You must manage Git branches and commits autonomously following this protocol:

1. **Base Verification & Setup:**
   - Confirm the default branch is named `main` (`git branch -M main`).
   - Create a complete `.gitignore` ignoring `node_modules`, `dist`, `.env`, coverage, and editor files.
   - Stage and commit initial configuration if untracked files exist:
     `git add .gitignore package.json ...`
     `git commit -m "chore: initial project workspace setup"`

2. **Branching Model per Phase:**
   Every implementation phase MUST be developed on an isolated branch:
   - Create and checkout branch: `git checkout -b <branch_name>`
   - Write code, tests, and procedural visual components.
   - Verify type checks (`pnpm run typecheck` or `tsc --noEmit`) and ensure all tests pass.
   - Create atomic commits following **Conventional Commits** (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`).
   - Switch back to `main`: `git checkout main`
   - Merge the feature branch: `git merge --no-ff <branch_name>`
   - Delete the local branch: `git branch -d <branch_name>`

3. **Phase-to-Branch Mapping:**
   - **Phase 1:** `feat/core-domain-bfs`
   - **Phase 2:** `feat/authoritative-backend-ws`
   - **Phase 3:** `feat/pixijs-procedural-client`
   - **Phase 4:** `feat/multiplayer-lifecycle-rooms`
   - **Phase 5:** `docs/architectural-readme`

---

## 1. Project Workspace & Tech Stack

Structure the project as a lightweight monorepo using `pnpm` workspaces:
- `packages/core`: Pure TypeScript domain models, move validation, collision engine, and BFS pathfinding. Zero framework dependencies.
- `apps/server`: NestJS backend, `@nestjs/websockets`, `socket.io`, authoritative game manager, and optional Redis room state adapter.
- `apps/web`: Vite, TypeScript, PixiJS v8+, `socket.io-client`, TailwindCSS (minimal UI shell / HUD only).

---

## 2. Zero-Asset Procedural Graphics Specification (PixiJS)

Do **NOT** attempt to import or fetch external image assets, sprites, or textures. All visuals must be constructed programmatically using PixiJS vector drawing primitives (`PIXI.Graphics` / `PIXI.Container`):

- **Palette Theme (Modern Minimalist Dark / Boardroom):**
  - Board Background: Deep Slate `#0F172A`
  - Board Tiles: Smooth Charcoal `#1E293B` with rounded corners (`radius: 4px`)
  - Tile Hover Highlight: Slate Blue `#334155`
  - Grooves / Gutters: Grid gaps of 8px separating tiles
  - Player 1 Pawn: Electric Cyan `#00E5FF` (concentric circle token with drop-shadow effect)
  - Player 2 Pawn: Radiant Coral `#FF5252` (concentric circle token with drop-shadow effect)
  - Wall Solid: Warm Sandstone / Amber `#F59E0B`
  - Ghost Wall (Hover preview): Translucent Cyan (`alpha: 0.5`) if legal, Translucent Red `#EF4444` (`alpha: 0.6`) if illegal
- **Interactive Wall Groove Hover:**
  - Track pointer over the 8x8 intersection grooves between tiles.
  - Render a floating ghost wall matching the current orientation (`HORIZONTAL` or `VERTICAL`).
  - Pressing the **Spacebar** or clicking a HUD toggle rotates the ghost wall orientation.
  - Clicking on a valid groove dispatches the `PlaceWall` action.

---

## 3. Phased Implementation Roadmap

### Phase 1: Core Domain, Collision & BFS Engine (`feat/core-domain-bfs`)
**Branch:** `git checkout -b feat/core-domain-bfs`

1. **Domain Models & Coordinates:**
   - 9x9 board coordinates: `Position { row: 0..8, col: 0..8 }`.
   - Walls: Anchor `(row: 0..7, col: 0..7)`, `orientation: 'HORIZONTAL' | 'VERTICAL'`. Each wall spans exactly 2 cell widths.
   - Players: `Player 1` starts at `(0, 4)` (target: `row == 8`), `Player 2` starts at `(8, 4)` (target: `row == 0`). 10 walls per player.
2. **Collision & Movement Policies:**
   - `WallCollisionValidator`: Tests horizontal/vertical overlaps, cross intersections (`+`), and checks whether a move between adjacent cells is obstructed by any existing wall.
   - `PawnMovementValidator`: Computes legal moves:
     - 1-step orthogonal moves.
     - Straight jumps over opponent when directly adjacent and not blocked behind.
     - Diagonal jumps when the straight jump is blocked by a wall or board perimeter.
3. **The Golden Rule (Pathfinding Invariant):**
   - Implement `PathfindingService.hasPathToGoal(player, walls)` using **Breadth-First Search (BFS)** over the 81-node grid.
   - Any wall placement that completely cuts off either player's ability to reach their target row is rejected as illegal.
4. **Aggregate Root (`QuoridorGame`):**
   - State machine enforcing turn alternation, wall depletion checks, move execution, and win detection.
5. **Unit Tests (100% Domain Rule Coverage):**
   - Test regular moves, jumps, boundary blocks.
   - Test wall collisions (overlaps, cross-cuts).
   - Test BFS Golden Rule (rejection of total blockage).
6. **Git Finalization:**
   - Commit: `git commit -m "feat(core): implement domain models, jump mechanics, and bfs validation"`
   - Merge to `main`: `git checkout main && git merge --no-ff feat/core-domain-bfs && git branch -d feat/core-domain-bfs`

---

### Phase 2: Authoritative Server & WebSockets (`feat/authoritative-backend-ws`)
**Branch:** `git checkout -b feat/authoritative-backend-ws`

1. **NestJS WebSocket Gateway:**
   - Setup `@WebSocketGateway({ cors: { origin: '*' } })` using Socket.io.
   - Event Handlers:
     - `game:create_or_join`
     - `game:move_pawn` (`{ row, col }`)
     - `game:place_wall` (`{ row, col, orientation }`)
2. **Authoritative State Enforcement:**
   - Server validates incoming commands against the player's turn and the `QuoridorGame` aggregate.
   - Rejects invalid actions with descriptive error events (`game:action_rejected`).
   - Broadcasts updated game snapshots (`game:state_updated`) and termination events (`game:game_over`).
3. **Integration Tests:**
   - End-to-end WebSocket tests simulating two connected socket clients playing valid and invalid moves.
4. **Git Finalization:**
   - Commit: `git commit -m "feat(server): build authoritative websocket gateway and room controller"`
   - Merge to `main`: `git checkout main && git merge --no-ff feat/authoritative-backend-ws && git branch -d feat/authoritative-backend-ws`

---

### Phase 3: PixiJS Procedural Client (`feat/pixijs-procedural-client`)
**Branch:** `git checkout -b feat/pixijs-procedural-client`

1. **PixiJS Canvas Component (`apps/web`):**
   - Initialize responsive `PIXI.Application` fitting modern desktop and mobile views.
   - Create `BoardRenderer`:
     - Programmatically draw 81 tiles with padding and rounded corners.
     - Highlight valid move destinations for the current player with clickable indicator discs.
   - Create `PawnRenderer`:
     - Render player tokens with smooth positional transitions (tweens / lerp).
   - Create `WallRenderer` & `GhostWallPreview`:
     - Draw placed walls.
     - Render mouse-tracking ghost wall with real-time color feedback (valid vs. blocked/violates BFS).
     - Keyboard listener for `Space` or `R` to toggle wall orientation.
2. **HUD & Status Bar:**
   - Display turn indicator, remaining walls counter for both players, and victory screen.
3. **Git Finalization:**
   - Commit: `git commit -m "feat(web): implement procedural board, ghost wall preview, and pixijs canvas"`
   - Merge to `main`: `git checkout main && git merge --no-ff feat/pixijs-procedural-client && git branch -d feat/pixijs-procedural-client`

---

### Phase 4: Matchmaking & Reconnection Lifecycle (`feat/multiplayer-lifecycle-rooms`)
**Branch:** `git checkout -b feat/multiplayer-lifecycle-rooms`

1. **Room & Match Lifecycle:**
   - Automatic 1v1 matchmaking queue or room code sharing (`?room=XYZ`).
   - Disconnection handling: 30-second reconnection grace period before forfeiting.
2. **Containerization:**
   - `Dockerfile` for `apps/server` and `apps/web`.
   - `docker-compose.yml` to run server and client with a single command: `docker-compose up --build`.
3. **Git Finalization:**
   - Commit: `git commit -m "feat(lifecycle): implement matchmaking rooms, reconnection grace, and docker-compose"`
   - Merge to `main`: `git checkout main && git merge --no-ff feat/multiplayer-lifecycle-rooms && git branch -d feat/multiplayer-lifecycle-rooms`

---

### Phase 5: Architecture README & Visual Documentation (`docs/architecture-readme`)
**Branch:** `git checkout -b docs/architecture-readme`

Write an exhaustive, portfolio-grade `README.md` containing:
1. **Project Pitch & Engineering Highlights:** Authoritative game architecture, real-time graph pathfinding, zero-asset rendering.
2. **Domain Invariants & Rules:**
   - Exact mathematical definition of wall placement validation.
   - Why BFS is optimal ($O(V + E)$ on 81 nodes taking $< 0.1\text{ ms}$).
3. **Mermaid Diagrams:**
   - **Hexagonal Architecture Overview:** Decoupling of `packages/core` from NestJS and PixiJS.
   - **Sequence Diagram:** Turn lifecycle (Client Intent -> Gateway -> Domain Aggregate -> BFS Simulation -> State Broadcast).
   - **State Machine Diagram:** Turn switching and game-over conditions.
4. **How to Run Locally:**
   - `pnpm install && pnpm dev` (local development).
   - `docker-compose up` (containerized execution).
   - Test execution commands (`pnpm test`).
5. **Git Finalization:**
   - Commit: `git commit -m "docs: write comprehensive architecture guide with mermaid diagrams"`
   - Merge to `main`: `git checkout main && git merge --no-ff docs/architecture-readme && git branch -d docs/architecture-readme`

---

## 4. Execution Mandate

Start immediately. Inspect the workspace, setup `.gitignore`, verify branch `main`, create `feat/core-domain-bfs`, and implement Phase 1. Proceed systematically through all phases.