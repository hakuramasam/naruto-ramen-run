import { create } from 'zustand';

export type ObstacleType = 'sasuke' | 'sakura' | 'hinata' | 'kakashi' | 'jobs';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  lane: number;
  z: number;
}

interface GameState {
  // Game status
  gameState: 'menu' | 'playing' | 'paused' | 'gameOver';
  score: number;
  highScore: number;
  distance: number;
  obstaclesAvoided: number;

  // Player state
  playerLane: number;
  isJumping: boolean;

  // Obstacles
  obstacles: Obstacle[];
  speed: number;

  // Actions
  startGame: () => void;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  jump: () => void;
  land: () => void;
  addObstacle: (obstacle: Obstacle) => void;
  removeObstacle: (id: string) => void;
  updateObstacles: (delta: number) => void;
  incrementScore: (amount: number) => void;
  incrementDistance: (amount: number) => void;
  incrementObstaclesAvoided: () => void;
  setSpeed: (speed: number) => void;
  setHighScore: (score: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameState: 'menu',
  score: 0,
  highScore: 0,
  distance: 0,
  obstaclesAvoided: 0,
  playerLane: 1, // 0, 1, 2 (left, middle, right)
  isJumping: false,
  obstacles: [],
  speed: 15,

  startGame: () => set({
    gameState: 'playing',
    score: 0,
    distance: 0,
    obstaclesAvoided: 0,
    playerLane: 1,
    isJumping: false,
    obstacles: [],
    speed: 15,
  }),

  endGame: () => set({ gameState: 'gameOver' }),

  pauseGame: () => set({ gameState: 'paused' }),

  resumeGame: () => set({ gameState: 'playing' }),

  moveLeft: () => {
    const { playerLane, gameState } = get();
    if (gameState === 'playing' && playerLane > 0) {
      set({ playerLane: playerLane - 1 });
    }
  },

  moveRight: () => {
    const { playerLane, gameState } = get();
    if (gameState === 'playing' && playerLane < 2) {
      set({ playerLane: playerLane + 1 });
    }
  },

  jump: () => {
    const { isJumping, gameState } = get();
    if (gameState === 'playing' && !isJumping) {
      set({ isJumping: true });
    }
  },

  land: () => set({ isJumping: false }),

  addObstacle: (obstacle) => set((state) => ({
    obstacles: [...state.obstacles, obstacle],
  })),

  removeObstacle: (id) => set((state) => ({
    obstacles: state.obstacles.filter((o) => o.id !== id),
  })),

  updateObstacles: (delta) => {
    const { obstacles, speed } = get();
    const movement = speed * delta;
    set({
      obstacles: obstacles.map((o) => ({ ...o, z: o.z + movement })),
    });
  },

  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),

  incrementDistance: (amount) => set((state) => ({ distance: state.distance + amount })),

  incrementObstaclesAvoided: () => set((state) => ({ obstaclesAvoided: state.obstaclesAvoided + 1 })),

  setSpeed: (speed) => set({ speed }),

  setHighScore: (highScore) => set({ highScore }),

  resetGame: () => set({
    gameState: 'menu',
    score: 0,
    distance: 0,
    obstaclesAvoided: 0,
    playerLane: 1,
    isJumping: false,
    obstacles: [],
    speed: 15,
  }),
}));
