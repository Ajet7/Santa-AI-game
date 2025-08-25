
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameOverReason } from './types';
import GameCanvas from '@/components/GameCanvas';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import ScoreDisplay from './components/ScoreDisplay';
import { GAME_TITLE_KEY, GAME_DURATION_SECONDS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.StartScreen);
  const [totalFilesCollected, setTotalFilesCollected] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [highScore, setHighScore] = useState<number>(() => {
    const savedHighScore = localStorage.getItem(GAME_TITLE_KEY);
    return savedHighScore ? parseInt(savedHighScore, 10) : 0;
  });
  const [gameId, setGameId] = useState<number>(0);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason | null>(null);

  const resetGameStats = useCallback(() => {
    setTotalFilesCollected(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setGameId(prevId => prevId + 1);
    setGameOverReason(null);
  }, []);

  const handleStartGame = useCallback(() => {
    resetGameStats();
    setGameState(GameState.Playing);
  }, [resetGameStats]);

  const handleGameOver = useCallback((reason: GameOverReason) => {
    setGameState(GameState.GameOver);
    setGameOverReason(reason);
    setHighScore(prevHigh => {
        if (totalFilesCollected > prevHigh) {
            localStorage.setItem(GAME_TITLE_KEY, totalFilesCollected.toString());
            return totalFilesCollected;
        }
        return prevHigh;
    });
  }, [totalFilesCollected]);

  const handleFileCollected = useCallback(() => {
    setTotalFilesCollected(prevFiles => prevFiles + 1);
  }, []);

  useEffect(() => {
    if (gameState === GameState.Playing && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (gameState === GameState.Playing && timeLeft <= 0) {
      handleGameOver('time_up');
    }
  }, [gameState, timeLeft, handleGameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === GameState.StartScreen || gameState === GameState.GameOver) {
          handleStartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, handleStartGame]);

  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  return (
    <div className="w-full min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4 select-none">
      <h1 className="text-4xl font-bold text-red-400 mb-2 tracking-wider">Santa's Bag Run!</h1>
      <p className="text-slate-300 mb-6 text-center">Tap screen or press SPACE to jump!<br/>Collect as many files as you can in {GAME_DURATION_SECONDS} seconds. Avoid the buildings!</p>
      
      <div className="relative shadow-2xl rounded-lg overflow-hidden border-2 border-red-500">
        {gameState === GameState.StartScreen && <StartScreen onStart={handleStartGame} />}
        {(gameState === GameState.Playing || gameState === GameState.GameOver) && (
          <>
            <ScoreDisplay 
              score={totalFilesCollected}
              highScore={highScore} 
              timeLeft={timeLeft}
            />
            <GameCanvas
              key={gameId}
              gameState={gameState}
              onGameOver={() => handleGameOver('collision')}
              onFileCollected={handleFileCollected}
              totalFilesCollected={totalFilesCollected}
            />
          </>
        )}
        {gameState === GameState.GameOver && gameOverReason && (
          <GameOverScreen 
            score={totalFilesCollected} 
            highScore={highScore} 
            onRestart={handleRestart} 
            reason={gameOverReason}
          />
        )}
      </div>
      <footer className="mt-6 text-center">
        <p className="text-sm text-slate-400">
          Game ends when time runs out or on collision. Good luck!
        </p>
      </footer>
    </div>
  );
};

export default App;
