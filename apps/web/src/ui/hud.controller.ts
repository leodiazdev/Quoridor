import { GameState, PlayerId, WallOrientation, PathfindingService } from '@quoridor/core';

export class HudController {
  private turnBadge = document.getElementById('turnBadge')!;
  private p1Card = document.getElementById('p1Card')!;
  private p2Card = document.getElementById('p2Card')!;
  private p1WallsText = document.getElementById('p1WallsText')!;
  private p2WallsText = document.getElementById('p2WallsText')!;
  private p1DistanceText = document.getElementById('p1DistanceText')!;
  private p2DistanceText = document.getElementById('p2DistanceText')!;
  private p1PipsContainer = document.getElementById('p1PipsContainer')!;
  private p2PipsContainer = document.getElementById('p2PipsContainer')!;
  private p1RoleTag = document.getElementById('p1RoleTag')!;
  private p2RoleTag = document.getElementById('p2RoleTag')!;

  private orientationBadge = document.getElementById('orientationBadge')!;
  private connectionStatus = document.getElementById('connectionStatus')!;
  private roomBadge = document.getElementById('roomBadge')!;
  private roomCodeText = document.getElementById('roomCodeText')!;

  private gameOverModal = document.getElementById('gameOverModal')!;
  private winnerTitle = document.getElementById('winnerTitle')!;
  private winnerSubtitle = document.getElementById('winnerSubtitle')!;
  private winnerIcon = document.getElementById('winnerIcon')!;

  private toastElement = document.getElementById('toastNotification')!;
  private toastMessage = document.getElementById('toastMessage')!;
  private toastTimeout?: ReturnType<typeof setTimeout>;

  public updateGameState(state: GameState, myRole?: PlayerId | 'spectator') {
    // 1. Turn Indicator
    if (state.status === 'FINISHED') {
      this.turnBadge.textContent = 'GAME OVER';
      this.turnBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
    } else {
      const isMyTurn = myRole === state.currentTurn;
      const turnLabel = myRole
        ? (isMyTurn ? 'YOUR TURN' : 'OPPONENT TURN')
        : (state.currentTurn === 'player1' ? 'PLAYER 1 TURN' : 'PLAYER 2 TURN');

      this.turnBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full ${state.currentTurn === 'player1' ? 'bg-cyan-400' : 'bg-rose-400'} animate-ping"></span>
        ${turnLabel}
      `;

      if (state.currentTurn === 'player1') {
        this.turnBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5';
      } else {
        this.turnBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5';
      }
    }

    // 2. Player 1 & 2 Cards Highlighting
    if (state.currentTurn === 'player1' && state.status === 'IN_PROGRESS') {
      this.p1Card.className = 'p-3.5 rounded-lg border-2 border-cyan-500/80 bg-cyan-950/30 shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-between scale-[1.02]';
      this.p2Card.className = 'p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 transition-all flex items-center justify-between opacity-80';
    } else if (state.currentTurn === 'player2' && state.status === 'IN_PROGRESS') {
      this.p1Card.className = 'p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 transition-all flex items-center justify-between opacity-80';
      this.p2Card.className = 'p-3.5 rounded-lg border-2 border-rose-500/80 bg-rose-950/30 shadow-lg shadow-rose-950/40 transition-all flex items-center justify-between scale-[1.02]';
    } else {
      this.p1Card.className = 'p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 transition-all flex items-center justify-between';
      this.p2Card.className = 'p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 transition-all flex items-center justify-between';
    }

    // 3. Walls Counter & Visual Pips
    this.p1WallsText.textContent = state.players.player1.wallsLeft.toString();
    this.p2WallsText.textContent = state.players.player2.wallsLeft.toString();
    this.renderWallPips(this.p1PipsContainer, state.players.player1.wallsLeft);
    this.renderWallPips(this.p2PipsContainer, state.players.player2.wallsLeft);

    // 4. Shortest Distance to Goal via Pathfinding BFS
    const p1Path = PathfindingService.findShortestPath(state.players.player1.position, 8, state.walls);
    const p2Path = PathfindingService.findShortestPath(state.players.player2.position, 0, state.walls);

    this.p1DistanceText.textContent = p1Path ? `Dist: ${p1Path.length - 1} steps` : 'Blocked!';
    this.p2DistanceText.textContent = p2Path ? `Dist: ${p2Path.length - 1} steps` : 'Blocked!';

    // 5. Role Tags
    if (myRole) {
      if (myRole === 'player1') {
        this.p1RoleTag.classList.remove('hidden');
        this.p1RoleTag.textContent = 'You';
        this.p2RoleTag.classList.remove('hidden');
        this.p2RoleTag.textContent = 'Opponent';
      } else if (myRole === 'player2') {
        this.p1RoleTag.classList.remove('hidden');
        this.p1RoleTag.textContent = 'Opponent';
        this.p2RoleTag.classList.remove('hidden');
        this.p2RoleTag.textContent = 'You';
      } else {
        this.p1RoleTag.classList.remove('hidden');
        this.p1RoleTag.textContent = 'P1';
        this.p2RoleTag.classList.remove('hidden');
        this.p2RoleTag.textContent = 'P2';
      }
    } else {
      this.p1RoleTag.classList.remove('hidden');
      this.p1RoleTag.textContent = 'P1';
      this.p2RoleTag.classList.remove('hidden');
      this.p2RoleTag.textContent = 'P2';
    }

    // 6. Game Over Modal
    if (state.status === 'FINISHED' && state.winner) {
      this.showGameOverModal(state.winner, myRole);
    } else {
      this.hideGameOverModal();
    }
  }

  private renderWallPips(container: HTMLElement, remainingWalls: number) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const pip = document.createElement('div');
      const isAvailable = i < remainingWalls;
      pip.className = `h-2 flex-1 rounded-sm transition-all duration-300 ${
        isAvailable ? 'bg-amber-400 shadow-sm shadow-amber-400/40' : 'bg-slate-800 border border-slate-700/50 opacity-40'
      }`;
      container.appendChild(pip);
    }
  }

  public updateOrientation(orientation: WallOrientation) {
    this.orientationBadge.textContent = orientation;
    this.orientationBadge.className =
      orientation === 'HORIZONTAL'
        ? 'text-xs font-mono text-amber-400 font-bold'
        : 'text-xs font-mono text-cyan-400 font-bold';
  }

  public updateConnection(status: 'online' | 'connecting' | 'local' | 'reconnecting', roomId?: string) {
    if (status === 'online') {
      this.connectionStatus.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Online (Server)</span>
      `;
      if (roomId) {
        this.roomBadge.classList.remove('hidden');
        this.roomCodeText.textContent = roomId;
      }
    } else if (status === 'connecting') {
      this.connectionStatus.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span>Connecting...</span>
      `;
    } else if (status === 'reconnecting') {
      this.connectionStatus.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
        <span>Reconnecting...</span>
      `;
    } else {
      this.connectionStatus.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-blue-400"></span>
        <span>Pass & Play (Local)</span>
      `;
      this.roomCodeText.textContent = 'LOCAL';
    }
  }

  public showToast(message: string) {
    this.toastMessage.textContent = message;
    this.toastElement.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');
    this.toastElement.classList.add('opacity-100', 'translate-y-0');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastElement.classList.remove('opacity-100', 'translate-y-0');
      this.toastElement.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
    }, 2800);
  }

  public showGameOverModal(winner: PlayerId, myRole?: PlayerId | 'spectator') {
    const isWinner = myRole === winner;
    const isP1 = winner === 'player1';

    if (myRole && myRole !== 'spectator') {
      this.winnerTitle.textContent = isWinner ? 'VICTORY!' : 'DEFEAT';
      this.winnerSubtitle.textContent = isWinner
        ? 'Outstanding strategy! You successfully navigated to the opposite baseline.'
        : 'Your opponent outmaneuvered your defenses and reached the goal first.';
      this.winnerIcon.textContent = isWinner ? '🏆' : '💀';
      this.winnerIcon.className = `w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl ${
        isWinner ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
      }`;
    } else {
      this.winnerTitle.textContent = isP1 ? 'PLAYER 1 VICTORIOUS!' : 'PLAYER 2 VICTORIOUS!';
      this.winnerSubtitle.textContent = `${isP1 ? 'Player 1 (Electric Cyan)' : 'Player 2 (Radiant Coral)'} reached the target baseline first.`;
      this.winnerIcon.textContent = '🏆';
      this.winnerIcon.className = `w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl ${
        isP1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
      }`;
    }

    this.gameOverModal.classList.remove('hidden');
    this.gameOverModal.classList.add('flex');
  }

  public hideGameOverModal() {
    this.gameOverModal.classList.remove('flex');
    this.gameOverModal.classList.add('hidden');
  }
}
