
import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { toast } from 'sonner';
import ChessBoard from '@/components/ChessBoard';
import GameControls from '@/components/GameControls';
import PlayerInfo from '@/components/PlayerInfo';

interface Player {
  name: string;
  color: 'white' | 'black';
  timeLeft: number;
}

interface GameState {
  playerA: Player;
  playerB: Player;
  currentTurn: 'white' | 'black';
}

const Game = () => {
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState<{
    type: 'checkmate' | 'stalemate' | 'draw' | 'timeout';
    winner?: string;
    message: string;
  } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const storedState = sessionStorage.getItem('chessGameState');
    if (!storedState) {
      navigate('/');
      return;
    }
    
    const state = JSON.parse(storedState);
    setGameState(state);
    
    if (state.playerA.color === 'black') {
      setIsFlipped(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (!gameState || gameOver) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev) return prev;
        
        const currentPlayer = prev.currentTurn === prev.playerA.color ? 'playerA' : 'playerB';
        const newTimeLeft = prev[currentPlayer].timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          const winner = currentPlayer === 'playerA' ? prev.playerB.name : prev.playerA.name;
          setGameOver({
            type: 'timeout',
            winner,
            message: `${winner} wins by timeout!`
          });
          return prev;
        }
        
        return {
          ...prev,
          [currentPlayer]: {
            ...prev[currentPlayer],
            timeLeft: newTimeLeft
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, gameOver]);

  const makeMove = useCallback((from: string, to: string) => {
    try {
      const move = game.move({
        from,
        to,
        promotion: 'q'
      });

      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            currentTurn: prev.currentTurn === 'white' ? 'black' : 'white'
          };
        });

        if (newGame.isCheckmate()) {
          const winner = gameState?.currentTurn === gameState?.playerA.color ? 
            gameState.playerA.name : gameState?.playerB.name;
          setGameOver({
            type: 'checkmate',
            winner,
            message: `Checkmate! ${winner} wins!`
          });
          toast.success(`Checkmate! ${winner} wins!`);
        } else if (newGame.isDraw() || newGame.isStalemate()) {
          setGameOver({
            type: newGame.isStalemate() ? 'stalemate' : 'draw',
            message: newGame.isStalemate() ? 'Stalemate - Draw!' : 'Draw!'
          });
          toast.info(newGame.isStalemate() ? 'Stalemate - Draw!' : 'Draw!');
        } else if (newGame.isCheck()) {
          toast.warning('Check!');
        }

        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
      toast.error('Invalid move');
    }
    return false;
  }, [game, gameState]);

  const handleResign = () => {
    if (!gameState) return;
    
    const currentPlayer = gameState.currentTurn === gameState.playerA.color ? 
      gameState.playerA : gameState.playerB;
    const winner = gameState.currentTurn === gameState.playerA.color ? 
      gameState.playerB.name : gameState.playerA.name;
    
    setGameOver({
      type: 'timeout',
      winner,
      message: `${currentPlayer.name} resigned. ${winner} wins!`
    });
  };

  const handleNewGame = () => {
    sessionStorage.removeItem('chessGameState');
    navigate('/');
  };

  const getCurrentPlayer = () => {
    if (!gameState) return null;
    return gameState.currentTurn === gameState.playerA.color ? gameState.playerA : gameState.playerB;
  };

  const getOpponentPlayer = () => {
    if (!gameState) return null;
    return gameState.currentTurn === gameState.playerA.color ? gameState.playerB : gameState.playerA;
  };

  if (!gameState) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-300">Loading...</div>
    </div>;
  }

  const currentPlayer = getCurrentPlayer();
  const opponentPlayer = getOpponentPlayer();
  const canMove = !gameOver;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <GameControls
          onFlipBoard={() => setIsFlipped(!isFlipped)}
          onResign={handleResign}
          onGoHome={() => navigate('/')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Info Sidebar */}
          <div className="space-y-4">
            {opponentPlayer && (
              <PlayerInfo
                player={opponentPlayer}
                isCurrentTurn={gameState.currentTurn === opponentPlayer.color}
                position="top"
              />
            )}
            
            {currentPlayer && (
              <PlayerInfo
                player={currentPlayer}
                isCurrentTurn={gameState.currentTurn === currentPlayer.color}
                position="bottom"
              />
            )}
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/30 p-6 rounded-xl backdrop-blur-lg border border-gray-700 shadow-2xl">
              <ChessBoard
                game={game}
                onMove={makeMove}
                isFlipped={isFlipped}
                canMove={canMove && gameState.currentTurn === currentPlayer?.color}
                currentPlayerColor={currentPlayer?.color || 'white'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`p-8 rounded-2xl max-w-md w-full text-center border ${
                gameOver.type === 'checkmate' 
                  ? 'bg-gradient-to-br from-red-900/90 to-red-800/90 border-red-600' 
                  : 'bg-gradient-to-br from-gray-800/90 to-gray-700/90 border-gray-600'
              } backdrop-blur-lg shadow-2xl`}
            >
              <div className="mb-6">
                {gameOver.type === 'checkmate' ? (
                  <Crown className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                ) : (
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-500 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full" />
                  </div>
                )}
                <h2 className="text-3xl font-bold text-white mb-2">
                  {gameOver.type === 'checkmate' ? 'Checkmate!' : 'Draw!'}
                </h2>
                <p className="text-gray-200 text-lg">{gameOver.message}</p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleNewGame}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 transition-all duration-200"
                >
                  New Game
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
