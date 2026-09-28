export type Language = 'es' | 'en';

export const TRANSLATIONS = {
  es: {
    appTitle: 'QUORIDOR',
    appBadge: 'Autoritativo',
    onlineServer: 'En Línea (Servidor)',
    connecting: 'Conectando...',
    reconnecting: 'Reconectando...',
    passAndPlay: 'Pasa y Juega (Local)',
    roomLabel: 'SALA:',
    copyRoom: 'Copiar enlace de sala',
    howToPlayBtn: '¿Cómo Jugar?',
    
    // Match status
    matchStatus: 'Estado de la Partida',
    p1Turn: 'TURNO JUGADOR 1',
    p2Turn: 'TURNO JUGADOR 2',
    yourTurn: '¡TU TURNO!',
    opponentTurn: 'TURNO RIVAL',
    gameOver: 'FIN DE PARTIDA',

    // Player cards
    player1: 'Jugador 1',
    player2: 'Jugador 2',
    you: 'Tú',
    opponent: 'Rival',
    p1Target: 'Meta: Fila 8 (Abajo)',
    p2Target: 'Meta: Fila 0 (Arriba)',
    wallsLeft: 'muros',
    distSteps: 'Dist: {steps} pasos',
    blocked: '¡Bloqueado!',

    // Wall deployment
    wallDeployment: 'Despliegue de Muros',
    orientationHorizontal: 'HORIZONTAL',
    orientationVertical: 'VERTICAL',
    wallHint: 'Pasa el cursor sobre los <strong>puntos entre casillas</strong> para ver el muro fantasma (Cian = Legal, Rojo = Ilegal). Pulsa <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-white">Espacio</kbd> o <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-white">R</kbd> para girarlo y haz <strong>clic</strong> para colocarlo.',
    rotateBtn: 'Girar Muro (Espacio/R)',
    resetBtn: 'Reiniciar',
    modeMovePawn: '♟ Mover Ficha',
    modePlaceWall: '🧱 Colocar Muro',

    // Controls footer
    controlsSpace: 'Girar Muro',
    controlsClickDisc: 'Clic en disco para mover',
    controlsClickGroove: 'Clic en ranura para muro',

    // Multiplayer panel
    multiplayerTitle: 'Multijugador en Tiempo Real',
    roomPlaceholder: 'CÓDIGO DE SALA',
    joinCreateBtn: 'Unirse / Crear',
    autoMatchBtn: 'Emparejamiento Automático (1v1)',
    switchToOffline: 'Cambiar a modo local (Pasa y Juega)',

    // Tutorial Modal
    tutorialTitle: '¿Cómo Jugar a Quoridor?',
    tutorialSubtitle: 'Juego de estrategia abstracta en tiempo real para 2 jugadores.',
    tutorialStep1Title: '1. Objetivo del Juego',
    tutorialStep1Desc: 'Sé el primero en llevar tu peón al lado opuesto del tablero (cualquiera de las casillas de la fila inicial del oponente).',
    tutorialStep2Title: '2. Mover tu Ficha',
    tutorialStep2Desc: 'En tu turno puedes mover 1 casilla ortogonalmente hacia cualquiera de los discos brillantes. Si tu rival está cara a cara, ¡puedes saltar por encima de él!',
    tutorialStep3Title: '3. Colocar Muros de Bloqueo',
    tutorialStep3Desc: 'Cada jugador dispone de 10 muros de 2 casillas de longitud. Pasa el cursor por las ranuras o puntos entre casillas para ver el muro fantasma. Pulsa Espacio o R para girarlo (Horizontal/Vertical) y haz clic para colocarlo.',
    tutorialStep4Title: '4. La Regla de Oro (Invariante BFS)',
    tutorialStep4Desc: '¡Está terminantemente prohibido encerrar por completo a un jugador! Siempre debe quedar al menos un camino libre hacia la meta. Si un muro bloquea el último camino, se pondrá en rojo y será rechazado.',
    tutorialGotItBtn: '¡Entendido, a jugar!',
    tutorialDontShow: 'No volver a mostrar automáticamente',

    // Victory Modal
    victoryTitle: '¡VICTORIA!',
    defeatTitle: 'DERROTA',
    p1Victorious: '¡JUGADOR 1 VICTORIOSO!',
    p2Victorious: '¡JUGADOR 2 VICTORIOSO!',
    victoryDescYou: '¡Estrategia brillante! Cruzaste las defensas enemigas y alcanzaste la meta.',
    defeatDescYou: 'Tu rival logró llegar primero a su línea de meta.',
    victoryDescP1: 'El Jugador 1 (Cian Eléctrico) ha alcanzado la fila 8 primero.',
    victoryDescP2: 'El Jugador 2 (Coral Radiante) ha alcanzado la fila 0 primero.',
    playAgainBtn: 'Jugar de Nuevo',
    reviewBoardBtn: 'Examinar Tablero',

    // Toasts
    toastIllegalMove: 'Movimiento ilegal',
    toastIllegalWall: 'Colocación de muro ilegal',
    toastWallOverlap: 'El muro se cruza o solapa con uno existente',
    toastGoldenRule: '¡Ilegal! El muro bloquearía todos los caminos a la meta',
    toastNoWalls: 'No te quedan muros disponibles',
    toastNotYourTurn: 'No es tu turno',
    toastRoomCopied: '¡Enlace de sala copiado al portapapeles!',
    toastSearching: 'Buscando oponente en la cola 1v1...',
    toastJoined: 'Conectado a la sala {room} como {role}',
    toastDisconnected: '{player} desconectado. Esperando 30s de reconexión...',
    toastRestarted: 'Partida reiniciada'
  },
  en: {
    appTitle: 'QUORIDOR',
    appBadge: 'Authoritative',
    onlineServer: 'Online (Server)',
    connecting: 'Connecting...',
    reconnecting: 'Reconnecting...',
    passAndPlay: 'Pass & Play (Local)',
    roomLabel: 'ROOM:',
    copyRoom: 'Copy room link',
    howToPlayBtn: 'How to Play?',

    // Match status
    matchStatus: 'Match Status',
    p1Turn: 'PLAYER 1 TURN',
    p2Turn: 'PLAYER 2 TURN',
    yourTurn: 'YOUR TURN!',
    opponentTurn: 'OPPONENT TURN',
    gameOver: 'GAME OVER',

    // Player cards
    player1: 'Player 1',
    player2: 'Player 2',
    you: 'You',
    opponent: 'Opponent',
    p1Target: 'Target: Row 8 (Bottom)',
    p2Target: 'Target: Row 0 (Top)',
    wallsLeft: 'walls',
    distSteps: 'Dist: {steps} steps',
    blocked: 'Blocked!',

    // Wall deployment
    wallDeployment: 'Wall Deployment',
    orientationHorizontal: 'HORIZONTAL',
    orientationVertical: 'VERTICAL',
    wallHint: 'Hover your cursor over the <strong>dots between tiles</strong> to see the ghost wall preview (Cyan = Legal, Red = Illegal). Press <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-white">Space</kbd> or <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-white">R</kbd> to rotate and <strong>click</strong> to place it.',
    rotateBtn: 'Rotate Wall (Space/R)',
    resetBtn: 'Restart',
    modeMovePawn: '♟ Move Pawn',
    modePlaceWall: '🧱 Place Wall',

    // Controls footer
    controlsSpace: 'Rotate Wall',
    controlsClickDisc: 'Click Disc to Move',
    controlsClickGroove: 'Click Groove to Place Wall',

    // Multiplayer panel
    multiplayerTitle: 'Real-Time Multiplayer',
    roomPlaceholder: 'ROOM CODE',
    joinCreateBtn: 'Join / Create',
    autoMatchBtn: 'Auto Matchmaking (1v1)',
    switchToOffline: 'Switch to Pass & Play (Local)',

    // Tutorial Modal
    tutorialTitle: 'How to Play Quoridor',
    tutorialSubtitle: 'Real-time abstract strategy game for 2 players.',
    tutorialStep1Title: '1. Objective of the Game',
    tutorialStep1Desc: 'Be the first player to reach the opposite side of the board (any cell in your opponent’s starting baseline).',
    tutorialStep2Title: '2. Moving Your Pawn',
    tutorialStep2Desc: 'On your turn, you can move 1 orthogonal step to any highlighted disc. If your opponent is face-to-face, you can jump straight over them!',
    tutorialStep3Title: '3. Placing Obstruction Walls',
    tutorialStep3Desc: 'Each player has 10 walls spanning 2 cell widths. Hover over the grooves/dots between tiles to preview the wall. Press Space or R to rotate (Horizontal/Vertical) and click to place.',
    tutorialStep4Title: '4. The Golden Rule (BFS Invariant)',
    tutorialStep4Desc: 'You may never completely trap any player! There must always remain at least one open path to the goal line for both players. Any wall that cuts off all paths turns red and is rejected.',
    tutorialGotItBtn: 'Got it, let’s play!',
    tutorialDontShow: 'Don’t show automatically again',

    // Victory Modal
    victoryTitle: 'VICTORY!',
    defeatTitle: 'DEFEAT',
    p1Victorious: 'PLAYER 1 VICTORIOUS!',
    p2Victorious: 'PLAYER 2 VICTORIOUS!',
    victoryDescYou: 'Masterful strategy! You penetrated enemy defenses and reached the baseline.',
    defeatDescYou: 'Your opponent outmaneuvered your walls and reached the goal first.',
    victoryDescP1: 'Player 1 (Electric Cyan) has reached row 8 first.',
    victoryDescP2: 'Player 2 (Radiant Coral) has reached row 0 first.',
    playAgainBtn: 'Play Again',
    reviewBoardBtn: 'Review Board',

    // Toasts
    toastIllegalMove: 'Illegal move',
    toastIllegalWall: 'Illegal wall placement',
    toastWallOverlap: 'Wall overlaps or intersects an existing wall',
    toastGoldenRule: 'Illegal! Placement completely blocks all paths to goal',
    toastNoWalls: 'No walls remaining',
    toastNotYourTurn: 'Not your turn',
    toastRoomCopied: 'Room link copied to clipboard!',
    toastSearching: 'Searching for opponent in 1v1 queue...',
    toastJoined: 'Joined room {room} as {role}',
    toastDisconnected: '{player} disconnected. Waiting 30s grace period...',
    toastRestarted: 'Game restarted'
  }
};

export class I18nManager {
  private currentLang: Language;

  constructor() {
    this.currentLang = this.detectInitialLanguage();
  }

  private detectInitialLanguage(): Language {
    const saved = localStorage.getItem('quoridor_lang');
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
    const nav = navigator.language || (navigator as any).userLanguage || '';
    if (nav.toLowerCase().startsWith('es')) {
      return 'es';
    }
    return 'en';
  }

  public getLanguage(): Language {
    return this.currentLang;
  }

  public setLanguage(lang: Language): void {
    this.currentLang = lang;
    localStorage.setItem('quoridor_lang', lang);
  }

  public t(key: keyof typeof TRANSLATIONS['es'], params?: Record<string, string | number>): string {
    let text = TRANSLATIONS[this.currentLang][key] || TRANSLATIONS['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  }
}

export const i18n = new I18nManager();
