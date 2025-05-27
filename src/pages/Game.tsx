import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Flag, RotateCcw, Home, Circle } from 'lucide-react';
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

  // Function to check if a move is valid before allowing the piece to be dropped
  const isDragAllowed = useCallback((args: { piece: string; sourceSquare: string }) => {
    if (gameOver) return false;
    if (!gameState) return false;
    
    // Get the piece color from the piece notation (first character indicates color)
    const pieceColor = args.piece.charAt(0) === 'w' ? 'white' : 'black';
    return pieceColor === gameState.currentTurn;
  }, [gameState, gameOver]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => navigate('/')}
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
            <div className="flex items-center justify-center gap-3 text-gray-300">
              <div className="flex items-center gap-1">
                {currentPlayer?.color === 'white' ? (
                  <Circle className="w-4 h-4 fill-white text-white" />
                ) : (
                  <Circle className="w-4 h-4 fill-gray-800 text-gray-800 border border-gray-400 rounded-full" />
                )}
                <span className="font-medium text-white">{currentPlayer?.name}</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-sm">Turn</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setIsFlipped(!isFlipped)}
              variant="outline"
              className="bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700 transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleResign}
              variant="destructive"
              className="bg-red-700 hover:bg-red-600 border-red-600 transition-all duration-200"
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
            <Card className="backdrop-blur-lg bg-gray-900/60 border-gray-700 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {opponentPlayer?.color === 'white' ? (
                      <Circle className="w-5 h-5 fill-white text-white" />
                    ) : (
                      <Circle className="w-5 h-5 fill-gray-800 text-gray-800 border border-gray-400 rounded-full" />
                    )}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{opponentPlayer?.name}</h3>
                      <p className="text-gray-400 text-sm font-medium">
                        {opponentPlayer?.color === 'white' ? 'White Pieces' : 'Black Pieces'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-mono font-bold ${
                    gameState.currentTurn !== opponentPlayer?.color ? 'text-gray-300' : 'text-green-400'
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
            <Card className="backdrop-blur-lg bg-gray-900/60 border-gray-700 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {currentPlayer?.color === 'white' ? (
                      <Circle className="w-5 h-5 fill-white text-white" />
                    ) : (
                      <Circle className="w-5 h-5 fill-gray-800 text-gray-800 border border-gray-400 rounded-full" />
                    )}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{currentPlayer?.name}</h3>
                      <p className="text-gray-400 text-sm font-medium">
                        {currentPlayer?.color === 'white' ? 'White Pieces' : 'Black Pieces'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-mono font-bold ${
                    gameState.currentTurn === currentPlayer?.color ? 'text-green-400' : 'text-gray-300'
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
            <div className="bg-gray-800/30 p-6 rounded-xl backdrop-blur-lg border border-gray-700 shadow-2xl">
              <div className="relative overflow-hidden rounded-xl">
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={makeMove}
                  boardOrientation={isFlipped ? 'black' : 'white'}
                  isDraggablePiece={isDragAllowed}
                  customBoardStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.8)',
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#374151' }}
                  customLightSquareStyle={{ backgroundColor: '#f3f4f6' }}
                  customDropSquareStyle={{
                    boxShadow: 'inset 0 0 1px 6px rgba(255,255,0,0.75)'
                  }}
                  customPremoveDarkSquareStyle={{
                    backgroundColor: '#CF6679'
                  }}
                  customPremoveLightSquareStyle={{
                    backgroundColor: '#F7DC6F'
                  }}
                />
              </div>
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
