
import React from 'react';
import { Card } from '@/components/ui/card';
import { Circle } from 'lucide-react';

interface Player {
  name: string;
  color: 'white' | 'black';
  timeLeft: number;
}

interface PlayerInfoProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'top' | 'bottom';
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isCurrentTurn, position }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="backdrop-blur-lg bg-gray-900/60 border-gray-700 p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {player.color === 'white' ? (
              <Circle className="w-5 h-5 fill-white text-white" />
            ) : (
              <Circle className="w-5 h-5 fill-gray-800 text-gray-800 border border-gray-400 rounded-full" />
            )}
            <div>
              <h3 className="text-white font-semibold text-lg">{player.name}</h3>
              <p className="text-gray-400 text-sm font-medium">
                {player.color === 'white' ? 'White Pieces' : 'Black Pieces'}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-mono font-bold ${
            isCurrentTurn ? 'text-green-400' : 'text-gray-300'
          }`}>
            {formatTime(player.timeLeft)}
          </div>
          {isCurrentTurn && (
            <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse" />
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlayerInfo;
