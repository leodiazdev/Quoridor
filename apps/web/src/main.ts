import './index.css';
import { QuoridorGame, Position, WallOrientation, GameState, PlayerId } from '@quoridor/core';
import { QuoridorView } from './render/quoridor.view.js';
import { HudController } from './ui/hud.controller.js';
import { TutorialModal } from './ui/tutorial.modal.js';
import { SocketClient } from './network/socket.client.js';
import { i18n } from './i18n/translations.js';

class QuoridorApp {
  private view = new QuoridorView();
  private hud = new HudController();
  private tutorialModal!: TutorialModal;
  private localGame = QuoridorGame.create('local');
  private socketClient!: SocketClient;

  private isMultiplayer = false;
  private currentGameState!: GameState;
  private currentLegalMoves: Position[] = [];

  public async start() {
    const canvasContainer = document.getElementById('canvasContainer')!;
    await this.view.init(canvasContainer);

    this.tutorialModal = new TutorialModal();
    this.currentGameState = this.localGame.getState();
    this.currentLegalMoves = this.localGame.getLegalMoves();

    this.setupViewCallbacks();
    this.setupKeyboardListeners();
    this.setupUiControls();
    this.setupNetworking();

    // Check URL parameters for room code (e.g. ?room=XYZ)
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');

    if (roomFromUrl) {
      this.isMultiplayer = true;
      this.hud.updateConnection('connecting');
      this.socketClient.joinRoom(roomFromUrl);
    } else {
      // Start in local pass & play, but socket connects in background ready for multiplayer
      this.hud.updateConnection('local');
      this.refreshView();
    }

    // Check if tutorial should be shown automatically on first visit
    this.tutorialModal.checkAutoShow();
  }

  private setupViewCallbacks() {
    this.view.wallValidator = (anchor: Position, orientation: WallOrientation) => {
      if (this.isMultiplayer) {
        const myRole = this.socketClient.getRole();
        if (!myRole || myRole === 'spectator' || myRole !== this.currentGameState.currentTurn) {
          return { valid: false, reason: i18n.t('toastNotYourTurn') };
        }
        // Local simulation with current server state
        const simGame = new QuoridorGame(this.currentGameState);
        return simGame.validatePlaceWall(myRole as PlayerId, anchor, orientation);
      } else {
        return this.localGame.validatePlaceWall(this.localGame.getState().currentTurn, anchor, orientation);
      }
    };

    this.view.onMoveSelected = (pos: Position) => {
      if (this.isMultiplayer) {
        this.socketClient.movePawn(pos.row, pos.col);
      } else {
        try {
          const turn = this.localGame.getState().currentTurn;
          this.localGame.movePawn(turn, pos);
          this.currentGameState = this.localGame.getState();
          this.currentLegalMoves = this.localGame.getLegalMoves();
          this.refreshView();
        } catch (err: any) {
          this.hud.showToast(err.message || i18n.t('toastIllegalMove'));
        }
      }
    };

    this.view.onWallPlaced = (anchor: Position, orientation: WallOrientation) => {
      if (this.isMultiplayer) {
        this.socketClient.placeWall(anchor.row, anchor.col, orientation);
      } else {
        try {
          const turn = this.localGame.getState().currentTurn;
          this.localGame.placeWall(turn, anchor, orientation);
          this.currentGameState = this.localGame.getState();
          this.currentLegalMoves = this.localGame.getLegalMoves();
          this.refreshView();
        } catch (err: any) {
          this.hud.showToast(err.message || i18n.t('toastIllegalWall'));
        }
      }
    };
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
        if (e.target === document.body || (e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
          const newOrientation = this.view.toggleOrientation();
          this.hud.updateOrientation(newOrientation);
        }
      }
    });
  }

  private setupUiControls() {
    // How to Play modal button
    const howToPlayBtn = document.getElementById('howToPlayBtn')!;
    howToPlayBtn.addEventListener('click', () => {
      this.tutorialModal.show();
    });

    this.hud.onLanguageChange = () => {
      this.tutorialModal.updateLanguage();
      this.refreshView();
    };

    this.hud.onModeChange = (mode) => {
      this.view.setInteractionMode(mode);
    };

    const rotateBtn = document.getElementById('rotateWallBtn')!;
    rotateBtn.addEventListener('click', () => {
      const newOrientation = this.view.toggleOrientation();
      this.hud.updateOrientation(newOrientation);
    });

    const resetBtn = document.getElementById('resetGameBtn')!;
    resetBtn.addEventListener('click', () => {
      if (this.isMultiplayer) {
        const roomId = this.socketClient.getRoomId();
        this.socketClient.joinRoom(roomId || undefined);
      } else {
        this.localGame = QuoridorGame.create('local');
        this.currentGameState = this.localGame.getState();
        this.currentLegalMoves = this.localGame.getLegalMoves();
        this.refreshView();
        this.hud.showToast(i18n.t('toastRestarted'));
      }
    });

    const joinBtn = document.getElementById('joinRoomBtn')!;
    const roomInput = document.getElementById('roomInput') as HTMLInputElement;

    joinBtn.addEventListener('click', () => {
      const code = roomInput.value.trim().toUpperCase() || undefined;
      this.isMultiplayer = true;
      this.hud.updateConnection('connecting');
      this.socketClient.joinRoom(code);
    });

    const quickMatchBtn = document.getElementById('quickMatchBtn')!;
    quickMatchBtn.addEventListener('click', () => {
      this.isMultiplayer = true;
      this.hud.updateConnection('connecting');
      this.socketClient.joinRoom(undefined);
      this.hud.showToast(i18n.t('toastSearching'));
    });

    roomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        joinBtn.click();
      }
    });

    const playOfflineBtn = document.getElementById('playOfflineBtn')!;
    playOfflineBtn.addEventListener('click', () => {
      this.isMultiplayer = false;
      this.localGame = QuoridorGame.create('local');
      this.currentGameState = this.localGame.getState();
      this.currentLegalMoves = this.localGame.getLegalMoves();
      this.hud.updateConnection('local');
      this.refreshView();
      this.hud.showToast(i18n.t('passAndPlay'));
    });

    const copyBtn = document.getElementById('copyRoomBtn')!;
    copyBtn.addEventListener('click', () => {
      const roomId = this.socketClient.getRoomId();
      if (roomId) {
        const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        navigator.clipboard.writeText(url).then(() => {
          this.hud.showToast(i18n.t('toastRoomCopied'));
        });
      }
    });

    const modalPlayAgain = document.getElementById('modalPlayAgainBtn')!;
    modalPlayAgain.addEventListener('click', () => {
      this.hud.hideGameOverModal();
      resetBtn.click();
    });

    const modalClose = document.getElementById('modalCloseBtn')!;
    modalClose.addEventListener('click', () => {
      this.hud.hideGameOverModal();
    });
  }

  private setupNetworking() {
    this.socketClient = new SocketClient({
      onConnected: () => {
        // Connected
      },
      onDisconnected: () => {
        if (this.isMultiplayer) {
          this.hud.updateConnection('reconnecting');
        }
      },
      onJoined: (roomId, assignedRole, state, legalMoves) => {
        this.isMultiplayer = true;
        this.currentGameState = state;
        this.currentLegalMoves = legalMoves;

        const newUrl = `${window.location.pathname}?room=${roomId}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);

        this.hud.updateConnection('online', roomId);
        this.refreshView();
        this.hud.showToast(i18n.t('toastJoined', { room: roomId, role: assignedRole.toUpperCase() }));
      },
      onStateUpdated: (state, legalMoves) => {
        this.currentGameState = state;
        this.currentLegalMoves = legalMoves;
        this.refreshView();
      },
      onActionRejected: (reason) => {
        this.hud.showToast(reason);
      },
      onGameOver: (_winner, state) => {
        this.currentGameState = state;
        this.currentLegalMoves = [];
        this.refreshView();
      },
      onPlayerDisconnected: (playerId, graceSeconds) => {
        this.hud.showToast(i18n.t('toastDisconnected', { player: playerId, seconds: graceSeconds }));
      }
    });

    this.socketClient.connect();
  }

  private refreshView() {
    const role = this.isMultiplayer ? this.socketClient.getRole() || undefined : undefined;
    this.view.updateState(this.currentGameState, this.currentLegalMoves, role);
    this.hud.updateGameState(this.currentGameState, role);
  }
}

// Bootstrap application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new QuoridorApp();
  app.start().catch(console.error);
});
