
import React from 'react';
import { GAME_WIDTH, GAME_HEIGHT, GAME_DURATION_SECONDS } from '../constants';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div
      className="absolute inset-0 bg-slate-800 bg-opacity-95 flex flex-col items-center justify-center p-8 text-center"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
    >
      <h2 className="text-5xl font-extrabold text-red-400 mb-4 animate-pulse">SANTA'S BAG RUN!</h2>
      <p className="text-2xl text-slate-300 mb-1">A 60-second time attack challenge!</p>
      <p className="text-lg text-slate-400 mb-8">
        Collect as many files as you can in {GAME_DURATION_SECONDS} seconds! 
        <br/>Jump over the buildings to keep your run going.
        <br/>The game ends when time runs out or if Santa hits a building.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-red-500 text-white text-2xl font-bold rounded-lg shadow-xl hover:bg-red-600 transition-colors transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
      >
        Start Running!
      </button>
      <p className="mt-8 text-lg text-slate-300">Tap 'Start Running!' or press <kbd className="px-2 py-1 text-sm font-semibold text-gray-200 bg-gray-600 border border-gray-500 rounded-md">Space</kbd> to begin!</p>
    </div>
  );
};

export default StartScreen;
