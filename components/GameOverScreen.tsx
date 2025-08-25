
import React from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { GameOverReason } from '../types';

interface GameOverScreenProps {
  score: number; // Files collected in this run
  highScore: number;
  onRestart: () => void;
  reason: GameOverReason;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  score,
  highScore,
  onRestart,
  reason
}) => {
  const endMessage = reason === 'time_up' ? "TIME'S UP!" : "RUN ENDED!";
  const isNewRecord = score > 0 && score === highScore;

  return (
    <div
      className="absolute inset-0 bg-red-900 bg-opacity-90 flex flex-col items-center justify-center p-8 text-center"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
    >
      <h2 className="text-6xl font-extrabold text-red-300 mb-6">
        {endMessage}
      </h2>
      <p className="text-3xl text-slate-200 mb-4">Files Collected: <span className="font-bold text-yellow-400">{score}</span></p>
      <p className="text-2xl text-slate-300 mb-8">Most Files Collected: <span className="font-bold text-yellow-400">{highScore}</span></p>
      
      {isNewRecord && (
        <p className="text-xl text-yellow-300 mb-4 animate-bounce">New Record!</p>
      )}

      <button
        onClick={onRestart}
        className="px-8 py-4 bg-red-500 text-white text-2xl font-bold rounded-lg shadow-xl hover:bg-red-600 transition-colors transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
      >
        Run Again!
      </button>
      <p className="mt-8 text-lg text-slate-300">Tap 'Run Again!' or press <kbd className="px-2 py-1 text-sm font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Space</kbd> to retry.</p>
    </div>
  );
};

export default GameOverScreen;
