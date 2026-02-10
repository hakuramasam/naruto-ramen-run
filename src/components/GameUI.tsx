import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useGameStore } from '../store/gameStore';
import { useAuthActions } from '@convex-dev/auth/react';

export function GameUI() {
  const { score, distance, gameState, startGame, resetGame, obstaclesAvoided, highScore, setHighScore, moveLeft, moveRight, jump } = useGameStore();
  const { signOut } = useAuthActions();
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const player = useQuery(api.players.getCurrentPlayer);
  const leaderboard = useQuery(api.players.getLeaderboard);
  const playerRank = useQuery(api.players.getPlayerRank);
  const getOrCreatePlayer = useMutation(api.players.getOrCreatePlayer);
  const submitScore = useMutation(api.players.submitScore);
  const updateWallet = useMutation(api.players.updateWallet);

  // Check if player needs to set username
  useEffect(() => {
    if (player === null && gameState === 'menu') {
      setShowUsernamePrompt(true);
    } else if (player) {
      setShowUsernamePrompt(false);
      setHighScore(player.highestScore);
    }
  }, [player, gameState, setHighScore]);

  const handleCreatePlayer = async () => {
    if (username.trim()) {
      await getOrCreatePlayer({ username: username.trim() });
      setShowUsernamePrompt(false);
    }
  };

  const handleStartGame = () => {
    if (!player) {
      setShowUsernamePrompt(true);
      return;
    }
    startGame();
  };

  const handleGameOver = async () => {
    if (player && gameState === 'gameOver') {
      const result = await submitScore({
        score,
        obstaclesAvoided,
        distanceTraveled: Math.floor(distance),
      });
      if (result.newHighScore) {
        setHighScore(score);
      }
    }
  };

  // Submit score on game over
  useEffect(() => {
    if (gameState === 'gameOver') {
      handleGameOver();
    }
  }, [gameState]);

  const handleSaveWallet = async () => {
    if (walletAddress.trim()) {
      await updateWallet({ walletAddress: walletAddress.trim() });
      setShowWallet(false);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none font-display">
      {/* Top HUD - Score & Stats */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 md:p-6 pointer-events-none">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="bg-black/60 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 border border-orange-500/30">
              <div className="text-orange-400 text-[10px] sm:text-xs tracking-wider">SCORE</div>
              <div className="text-white text-xl sm:text-3xl md:text-4xl tabular-nums">{score.toLocaleString()}</div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <div className="bg-black/60 backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-purple-500/30">
                <div className="text-purple-400 text-[8px] sm:text-[10px] tracking-wider">DISTANCE</div>
                <div className="text-white text-base sm:text-xl tabular-nums">{Math.floor(distance)}m</div>
              </div>
              <div className="bg-black/60 backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-blue-500/30">
                <div className="text-blue-400 text-[8px] sm:text-[10px] tracking-wider">AVOIDED</div>
                <div className="text-white text-base sm:text-xl tabular-nums">{obstaclesAvoided}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Touch Controls */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 pointer-events-auto sm:hidden px-4">
          <button
            onTouchStart={(e) => { e.preventDefault(); moveLeft(); }}
            className="w-16 h-16 bg-black/60 backdrop-blur-md rounded-full border-2 border-orange-500/50 flex items-center justify-center active:bg-orange-500/30 transition-colors touch-none"
          >
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); jump(); }}
            className="w-20 h-20 bg-black/60 backdrop-blur-md rounded-full border-2 border-yellow-500/50 flex items-center justify-center active:bg-yellow-500/30 transition-colors touch-none"
          >
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); moveRight(); }}
            className="w-16 h-16 bg-black/60 backdrop-blur-md rounded-full border-2 border-orange-500/50 flex items-center justify-center active:bg-orange-500/30 transition-colors touch-none"
          >
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && !showUsernamePrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto px-4">
          <div className="text-center max-w-md w-full">
            <h1 className="text-4xl sm:text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 mb-2 sm:mb-4 animate-pulse">
              NARUTO
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-orange-300 mb-6 sm:mb-8">RAMEN RUN</h2>

            {player && (
              <div className="mb-4 sm:mb-6 text-gray-300 font-body text-sm sm:text-base">
                <span className="text-orange-400">Welcome, </span>
                {player.username}
                {playerRank && (
                  <span className="ml-2 text-xs sm:text-sm text-purple-400">
                    (Rank #{playerRank.rank})
                  </span>
                )}
              </div>
            )}

            {highScore > 0 && (
              <div className="mb-4 sm:mb-6 bg-black/40 rounded-xl px-4 sm:px-6 py-2 sm:py-3 inline-block border border-yellow-500/30">
                <div className="text-yellow-400 text-[10px] sm:text-xs tracking-wider">HIGH SCORE</div>
                <div className="text-white text-xl sm:text-2xl md:text-3xl">{highScore.toLocaleString()}</div>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={handleStartGame}
                className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-lg sm:text-xl md:text-2xl rounded-xl sm:rounded-2xl hover:from-orange-400 hover:to-yellow-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30"
              >
                START GAME
              </button>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-purple-600/80 text-white text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-purple-500 transition-all border border-purple-400/30"
                >
                  LEADERBOARD
                </button>
                <button
                  onClick={() => setShowWallet(true)}
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-blue-600/80 text-white text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-blue-500 transition-all border border-blue-400/30"
                >
                  WALLET
                </button>
              </div>

              <button
                onClick={() => signOut()}
                className="w-full py-2 sm:py-2.5 px-4 sm:px-6 bg-transparent text-gray-400 text-sm sm:text-base rounded-xl hover:text-white hover:bg-white/10 transition-all border border-gray-600/30"
              >
                SIGN OUT
              </button>
            </div>

            <div className="mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm font-body">
              <p className="hidden sm:block">Use <span className="text-orange-400">← →</span> or <span className="text-orange-400">A D</span> to move</p>
              <p className="hidden sm:block">Press <span className="text-orange-400">SPACE</span> or <span className="text-orange-400">W</span> to jump</p>
              <p className="sm:hidden">Tap the buttons to move and jump</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto px-4">
          <div className="text-center bg-black/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-red-500/30 shadow-2xl shadow-red-500/20 max-w-md w-full">
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-red-500 mb-4 sm:mb-6 animate-pulse">GAME OVER</h2>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-black/40 rounded-xl p-3 sm:p-4 border border-orange-500/30">
                <div className="text-orange-400 text-[10px] sm:text-xs tracking-wider">SCORE</div>
                <div className="text-white text-xl sm:text-2xl md:text-3xl">{score.toLocaleString()}</div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 sm:p-4 border border-purple-500/30">
                <div className="text-purple-400 text-[10px] sm:text-xs tracking-wider">DISTANCE</div>
                <div className="text-white text-xl sm:text-2xl md:text-3xl">{Math.floor(distance)}m</div>
              </div>
            </div>

            {score > highScore && (
              <div className="mb-4 sm:mb-6 py-2 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl border border-yellow-500/50">
                <span className="text-yellow-400 text-base sm:text-xl">🎉 NEW HIGH SCORE! 🎉</span>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={() => startGame()}
                className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-lg sm:text-xl md:text-2xl rounded-xl sm:rounded-2xl hover:from-orange-400 hover:to-yellow-400 transition-all transform hover:scale-105 active:scale-95"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => resetGame()}
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-white/10 text-white text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all border border-gray-500/30"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Username Prompt Modal */}
      {showUsernamePrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto px-4">
          <div className="text-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-orange-500/30 shadow-2xl max-w-md w-full">
            <h2 className="text-2xl sm:text-3xl text-orange-400 mb-4 sm:mb-6">CHOOSE YOUR NINJA NAME</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              maxLength={20}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-black/40 border border-orange-500/30 rounded-xl sm:rounded-2xl text-white text-lg sm:text-xl text-center placeholder-gray-500 focus:outline-none focus:border-orange-500 mb-4 sm:mb-6 font-body"
            />
            <button
              onClick={handleCreatePlayer}
              disabled={!username.trim()}
              className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-lg sm:text-xl rounded-xl sm:rounded-2xl hover:from-orange-400 hover:to-yellow-400 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              CONFIRM
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto p-4">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-purple-500/30 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl text-purple-400">TOP 15 NINJAS</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-400 hover:text-white text-2xl sm:text-3xl transition-colors p-1"
              >
                ×
              </button>
            </div>

            <div className="text-xs sm:text-sm text-purple-300/70 mb-3 sm:mb-4 font-body">
              Top 15 players are eligible for token airdrops! 🪂
            </div>

            <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1 pr-2">
              {leaderboard?.map((entry: { rank: number; username: string; highestScore: number; totalGamesPlayed: number; hasWallet: boolean; walletAddress: string | undefined }, index: number) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl ${
                    index < 3
                      ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-500/30'
                      : 'bg-black/40 border border-gray-600/30'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span
                      className={`w-6 sm:w-8 text-base sm:text-xl ${
                        index === 0
                          ? 'text-yellow-400'
                          : index === 1
                            ? 'text-gray-300'
                            : index === 2
                              ? 'text-orange-400'
                              : 'text-gray-500'
                      }`}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className="text-white font-body text-sm sm:text-base truncate">{entry.username}</span>
                    {entry.hasWallet && (
                      <span className="text-green-400 text-[10px] sm:text-xs flex-shrink-0">💰</span>
                    )}
                  </div>
                  <span className="text-orange-400 tabular-nums text-sm sm:text-base flex-shrink-0 ml-2">
                    {entry.highestScore.toLocaleString()}
                  </span>
                </div>
              ))}

              {(!leaderboard || leaderboard.length === 0) && (
                <div className="text-center text-gray-500 py-8 font-body text-sm sm:text-base">
                  No players yet. Be the first!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWallet && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto p-4">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-blue-500/30 shadow-2xl max-w-lg w-full">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl text-blue-400">WALLET SETUP</h2>
              <button
                onClick={() => setShowWallet(false)}
                className="text-gray-400 hover:text-white text-2xl sm:text-3xl transition-colors p-1"
              >
                ×
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-gray-300 font-body mb-3 sm:mb-4 text-sm sm:text-base">
                Enter your wallet address to receive token airdrops if you reach the top 15!
              </p>

              {player?.walletAddress && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="text-green-400 text-xs sm:text-sm mb-1">Current Wallet:</div>
                  <div className="text-white font-mono text-xs sm:text-sm truncate">{player.walletAddress}</div>
                </div>
              )}

              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x... or ENS name"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-black/40 border border-blue-500/30 rounded-xl sm:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm sm:text-base"
              />
            </div>

            <button
              onClick={handleSaveWallet}
              disabled={!walletAddress.trim()}
              className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-base sm:text-xl rounded-xl sm:rounded-2xl hover:from-blue-400 hover:to-purple-400 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              SAVE WALLET
            </button>

            {playerRank && playerRank.isTop15 && (
              <div className="mt-4 sm:mt-6 text-center text-green-400 font-body text-sm sm:text-base">
                🎉 You're in the top 15! You'll receive airdrops!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
