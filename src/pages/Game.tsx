
import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Flag, RotateCcw, Home } from 'lucide-react';
import { toast } from 'sonner';

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

  // Load game state from sessionStorage
  useEffect(() => {
    const storedState = sessionStorage.getItem('chessGameState');
    if (!storedState) {
      navigate('/');
      return;
    }
    
    const state = JSON.parse(storedState);
    setGameState(state);
    
    // Flip board if player A is black
    if (state.playerA.color === 'black') {
      setIsFlipped(true);
    }
  }, [navigate]);

  // Timer logic
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const makeMove = useCallback((sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        
        // Switch turns
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            currentTurn: prev.currentTurn === 'white' ? 'black' : 'white'
          };
        });

        // Check game status
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
      console.log('Invalid move');
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
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  const currentPlayer = getCurrentPlayer();
  const opponentPlayer = getOpponentPlayer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">Chess Master</h1>
            <p className="text-slate-300 text-sm">
              {currentPlayer?.name}'s turn ({currentPlayer?.color})
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setIsFlipped(!isFlipped)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleResign}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Flag className="w-4 h-4 mr-2" />
              Resign
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Info Sidebar */}
          <div className="space-y-4">
            {/* Opponent */}
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{opponentPlayer?.name}</h3>
                  <p className="text-slate-300 text-sm capitalize">{opponentPlayer?.color} pieces</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-mono ${
                    gameState.currentTurn !== opponentPlayer?.color ? 'text-white' : 'text-green-400'
                  }`}>
                    {formatTime(opponentPlayer?.timeLeft || 0)}
                  </div>
                  {gameState.currentTurn !== opponentPlayer?.color && (
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse" />
                  )}
                </div>
              </div>
            </Card>

            {/* Current Player */}
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{currentPlayer?.name}</h3>
                  <p className="text-slate-300 text-sm capitalize">{currentPlayer?.color} pieces</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-mono ${
                    gameState.currentTurn === currentPlayer?.color ? 'text-green-400' : 'text-white'
                  }`}>
                    {formatTime(currentPlayer?.timeLeft || 0)}
                  </div>
                  {gameState.currentTurn === currentPlayer?.color && (
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse" />
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-2 relative">
            <div className="bg-white/5 p-4 rounded-lg backdrop-blur-lg border border-white/10">
              <Chessboard
                position={game.fen()}
                onPieceDrop={makeMove}
                boardOrientation={isFlipped ? 'black' : 'white'}
                customBoardStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                }}
                customDarkSquareStyle={{ backgroundColor: '#4f46e5' }}
                customLightSquareStyle={{ backgroundColor: '#e0e7ff' }}
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`p-8 rounded-2xl max-w-md w-full text-center ${
                gameOver.type === 'checkmate' 
                  ? 'bg-gradient-to-br from-red-600 to-red-800' 
                  : 'bg-gradient-to-br from-gray-600 to-gray-800'
              }`}
            >
              <div className="mb-6">
                {gameOver.type === 'checkmate' ? (
                  <Crown className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                ) : (
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-400 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full" />
                  </div>
                )}
                <h2 className="text-3xl font-bold text-white mb-2">
                  {gameOver.type === 'checkmate' ? 'Checkmate!' : 'Draw!'}
                </h2>
                <p className="text-white/90 text-lg">{gameOver.message}</p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleNewGame}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
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
