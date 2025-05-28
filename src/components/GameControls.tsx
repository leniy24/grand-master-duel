
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Flag, Home } from 'lucide-react';

interface GameControlsProps {
  onFlipBoard: () => void;
  onResign: () => void;
  onGoHome: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onFlipBoard,
  onResign,
  onGoHome
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Button
        onClick={onGoHome}
        variant="outline"
        className="bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700 transition-all duration-200"
      >
        <Home className="w-4 h-4 mr-2" />
        Home
      </Button>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Chess Master
        </h1>
        <div className="text-gray-300 text-sm">
          Click a piece to select it, then click where you want to move
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onFlipBoard}
          variant="outline"
          className="bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={onResign}
          variant="destructive"
          className="bg-red-700 hover:bg-red-600 border-red-600 transition-all duration-200"
        >
          <Flag className="w-4 h-4 mr-2" />
          Resign
        </Button>
      </div>
    </div>
  );
};

export default GameControls;
