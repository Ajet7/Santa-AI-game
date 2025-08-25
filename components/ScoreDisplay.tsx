
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
  timeLeft: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
    score,
    highScore,
    timeLeft
}) => {
  return (
    <div className="absolute top-2 left-0 right-0 flex flex-col sm:flex-row justify-around items-center text-lg sm:text-xl px-2 z-10 space-y-1 sm:space-y-0">
      <p className="font-bold text-sky-200 bg-slate-800 bg-opacity-70 px-3 py-1 rounded-md shadow-md">
        Time: <span className="text-yellow-300">{timeLeft}</span>
      </p>
      <p className="font-bold text-sky-200 bg-slate-800 bg-opacity-70 px-3 py-1 rounded-md shadow-md">
        Files: <span className="text-yellow-300">{score}</span>
      </p>
       <p className="font-bold text-sky-200 bg-slate-800 bg-opacity-70 px-3 py-1 rounded-md shadow-md">
        High Score: <span className="text-yellow-300">{highScore}</span>
      </p>
    </div>
  );
};

export default ScoreDisplay;
