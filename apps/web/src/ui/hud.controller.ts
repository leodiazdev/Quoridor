import { GameState, PlayerId, WallOrientation, PathfindingService } from '@quoridor/core';
import { i18n, Language } from '../i18n/translations.js';

export class HudController {
  private turnBadge = document.getElementById('turnBadge')!;
  private p1Card = document.getElementById('p1Card')!;
  private p2Card = document.getElementById('p2Card')!;
  private p1NameText = document.getElementById('p1NameText')!;
  private p2NameText = document.getElementById('p2NameText')!;
  private p1TargetText = document.getElementById('p1TargetText')!;
  private p2TargetText = document.getElementById('p2TargetText')!;
  private p1WallsText = document.getElementById('p1WallsText')!;
  private p2WallsText = document.getElementById('p2WallsText')!;
  private p1WallsLabel = document.getElementById('p1WallsLabel')!;
  private p2WallsLabel = document.getElementById('p2WallsLabel')!;
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

  private modeMoveBtn = document.getElementById('modeMoveBtn')!;
  private modeWallBtn = document.getElementById('modeWallBtn')!;

  private langEsBtn = document.getElementById('langEsBtn')!;
  private langEnBtn = document.getElementById('langEnBtn')!;

  private gameOverModal = document.getElementById('gameOverModal')!;
  private winnerTitle = document.getElementById('winnerTitle')!;
  private winnerSubtitle = document.getElementById('winnerSubtitle')!;
  private winnerIcon = document.getElementById('winnerIcon')!;

  private toastElement = document.getElementById('toastNotification')!;
  private toastMessage = document.getElementById('toastMessage')!;
  private toastTimeout?: ReturnType<typeof setTimeout>;

  public onLanguageChange?: (lang: Language) => void;
  public onModeChange?: (mode: 'MOVE' | 'WALL') => void;

  private currentMode: 'MOVE' | 'WALL' = 'MOVE';
  private lastGameState?: GameState;
  private lastMyRole?: PlayerId | 'spectator';

  constructor() {
    this.setupListeners();
    this.updateLanguageUI();
  }

  private setupListeners() {
    this.langEsBtn.addEventListener('click', () => {
      i18n.setLanguage('es');
      this.updateLanguageUI();
      this.onLanguageChange?.('es');
    });

    this.langEnBtn.addEventListener('click', () => {
      i18n.setLanguage('en');
      this.updateLanguageUI();
      this.onLanguageChange?.('en');
    });

    this.modeMoveBtn.addEventListener('click', () => {
      this.setInteractionMode('MOVE');
    });

    this.modeWallBtn.addEventListener('click', () => {
      this.setInteractionMode('WALL');
    });
  }

  public setInteractionMode(mode: 'MOVE' | 'WALL') {
    this.currentMode = mode;
    if (mode === 'MOVE') {
      this.modeMoveBtn.className = 'py-1.5 px-2 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition shadow-sm';
      this.modeWallBtn.className = 'py-1.5 px-2 rounded text-xs font-semibold text-slate-400 hover:text-white border border-transparent transition';
    } else {
      this.modeMoveBtn.className = 'py-1.5 px-2 rounded text-xs font-semibold text-slate-400 hover:text-white border border-transparent transition';
      this.modeWallBtn.className = 'py-1.5 px-2 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 transition shadow-sm';
    }
    this.onModeChange?.(mode);
  }

  public getInteractionMode(): 'MOVE' | 'WALL' {
    return this.currentMode;
  }

  public updateLanguageUI() {
    const lang = i18n.getLanguage();

    if (lang === 'es') {
      this.langEsBtn.className = 'px-2.5 py-1 rounded-full text-cyan-400 bg-slate-700/90 shadow-sm transition';
      this.langEnBtn.className = 'px-2.5 py-1 rounded-full text-slate-400 hover:text-white transition';
    } else {
      this.langEsBtn.className = 'px-2.5 py-1 rounded-full text-slate-400 hover:text-white transition';
      this.langEnBtn.className = 'px-2.5 py-1 rounded-full text-cyan-400 bg-slate-700/90 shadow-sm transition';
    }

    document.getElementById('howToPlayText')!.textContent = i18n.t('howToPlayBtn');
    document.getElementById('roomLabel')!.textContent = i18n.t('roomLabel');
    document.getElementById('matchStatusLabel')!.textContent = i18n.t('matchStatus');
    document.getElementById('controlsSpaceText')!.textContent = i18n.t('controlsSpace');
    document.getElementById('controlsDiscText')!.textContent = i18n.t('controlsClickDisc');
    document.getElementById('controlsGrooveText')!.textContent = i18n.t('controlsClickGroove');

    document.getElementById('wallDeploymentTitle')!.textContent = i18n.t('wallDeployment');
    document.getElementById('modeMoveText')!.textContent = i18n.t('modeMovePawn');
    document.getElementById('modeWallText')!.textContent = i18n.t('modePlaceWall');
    document.getElementById('wallHintText')!.innerHTML = i18n.t('wallHint');
    document.getElementById('rotateWallText')!.textContent = i18n.t('rotateBtn');
    document.getElementById('resetGameText')!.textContent = i18n.t('resetBtn');

    document.getElementById('multiplayerTitle')!.textContent = i18n.t('multiplayerTitle');
    (document.getElementById('roomInput') as HTMLInputElement).placeholder = i18n.t('roomPlaceholder');
    document.getElementById('joinCreateText')!.textContent = i18n.t('joinCreateBtn');
    document.getElementById('autoMatchText')!.textContent = i18n.t('autoMatchBtn');
    document.getElementById('switchToOfflineText')!.textContent = i18n.t('switchToOffline');

    document.getElementById('modalPlayAgainBtn')!.textContent = i18n.t('playAgainBtn');
    document.getElementById('modalCloseBtn')!.textContent = i18n.t('reviewBoardBtn');

    this.p1NameText.textContent = i18n.t('player1');
    this.p2NameText.textContent = i18n.t('player2');
    this.p1TargetText.textContent = i18n.t('p1Target');
    this.p2TargetText.textContent = i18n.t('p2Target');
    this.p1WallsLabel.textContent = i18n.t('wallsLeft');
    this.p2WallsLabel.textContent = i18n.t('wallsLeft');

    if (this.lastGameState) {
      this.updateGameState(this.lastGameState, this.lastMyRole);
    }
  }

  public updateGameState(state: GameState, myRole?: PlayerId | 'spectator') {
    this.lastGameState = state;
    this.lastMyRole = myRole;

    // 1. Turn Indicator
    if (state.status === 'FINISHED') {
      this.turnBadge.textContent = i18n.t('gameOver');
      this.turnBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
    } else {
      const isMyTurn = myRole === state.currentTurn;
      const turnLabel = myRole
        ? (isMyTurn ? i18n.t('yourTurn') : i18n.t('opponentTurn'))
        : (state.currentTurn === 'player1' ? i18n.t('p1Turn') : i18n.t('p2Turn'));

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
      this.p1Card.className = 'p-3.5 rounded-lg border-2 border-cyan-500/80 bg-cyan-950/30 shadow-lg shadow-cyan-950/40 transition-all flex flex-col gap-2 scale-[1.02]';
      this.p2Card.className = 'p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 transition-all flex flex-col gap-2 opacity-80';
    } else if (state.currentTurn === 'player2' && state.status === 'IN_PROGRESS') {
      this.p1Card.className = 'p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 transition-all flex flex-col gap-2 opacity-80';
      this.p2Card.className = 'p-3.5 rounded-lg border-2 border-rose-500/80 bg-rose-950/30 shadow-lg shadow-rose-950/40 transition-all flex flex-col gap-2 scale-[1.02]';
    } else {
      this.p1Card.className = 'p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 transition-all flex flex-col gap-2';
      this.p2Card.className = 'p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 transition-all flex flex-col gap-2';
    }

    // 3. Walls Counter & Visual Pips
    this.p1WallsText.textContent = state.players.player1.wallsLeft.toString();
    this.p2WallsText.textContent = state.players.player2.wallsLeft.toString();
    this.renderWallPips(this.p1PipsContainer, state.players.player1.wallsLeft);
    this.renderWallPips(this.p2PipsContainer, state.players.player2.wallsLeft);

    // 4. Shortest Distance to Goal via Pathfinding BFS
    const p1Path = PathfindingService.findShortestPath(state.players.player1.position, 8, state.walls);
    const p2Path = PathfindingService.findShortestPath(state.players.player2.position, 0, state.walls);

    this.p1DistanceText.textContent = p1Path ? i18n.t('distSteps', { steps: p1Path.length - 1 }) : i18n.t('blocked');
    this.p2DistanceText.textContent = p2Path ? i18n.t('distSteps', { steps: p2Path.length - 1 }) : i18n.t('blocked');

    // 5. Role Tags
    if (myRole) {
      if (myRole === 'player1') {
        this.p1RoleTag.classList.remove('hidden');
        this.p1RoleTag.textContent = i18n.t('you');
        this.p2RoleTag.classList.remove('hidden');
        this.p2RoleTag.textContent = i18n.t('opponent');
      } else if (myRole === 'player2') {
        this.p1RoleTag.classList.remove('hidden');
        this.p1RoleTag.textContent = i18n.t('opponent');
        this.p2RoleTag.classList.remove('hidden');
        this.p2RoleTag.textContent = i18n.t('you');
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
    this.orientationBadge.textContent =
      orientation === 'HORIZONTAL' ? i18n.t('orientationHorizontal') : i18n.t('orientationVertical');
    this.orientationBadge.className =
      orientation === 'HORIZONTAL'
        ? 'text-xs font-mono text-amber-400 font-bold'
        : 'text-xs font-mono text-cyan-400 font-bold';
  }

  public updateConnection(status: 'online' | 'connecting' | 'local' | 'reconnecting', roomId?: string) {
    if (status === 'online') {
      this.connectionStatus.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>${i18n.t('onlineServer')}</span>
      `;
      if (roomId) {
        this.roomBadge.classList.remove('hidden');
        this.roomCodeText.textContent = roomId;
      }
    } else if (status === 'connecting') {
      this.connectionStatus.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span>${i18n.t('connecting')}</span>
      `;
    } else if (status === 'reconnecting') {
      this.connectionStatus.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
        <span>${i18n.t('reconnecting')}</span>
      `;
    } else {
      this.connectionStatus.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-blue-400"></span>
        <span>${i18n.t('passAndPlay')}</span>
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
      this.winnerTitle.textContent = isWinner ? i18n.t('victoryTitle') : i18n.t('defeatTitle');
      this.winnerSubtitle.textContent = isWinner ? i18n.t('victoryDescYou') : i18n.t('defeatDescYou');
      this.winnerIcon.textContent = isWinner ? '🏆' : '💀';
      this.winnerIcon.className = `w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl ${
        isWinner ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
      }`;
    } else {
      this.winnerTitle.textContent = isP1 ? i18n.t('p1Victorious') : i18n.t('p2Victorious');
      this.winnerSubtitle.textContent = isP1 ? i18n.t('victoryDescP1') : i18n.t('victoryDescP2');
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
