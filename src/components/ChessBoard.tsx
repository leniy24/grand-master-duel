
import React, { useState, useCallback, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { toast } from 'sonner';

interface ChessBoardProps {
  game: Chess;
  onMove: (from: string, to: string) => boolean;
  isFlipped: boolean;
  canMove: boolean;
  currentPlayerColor: 'white' | 'black';
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  onMove,
  isFlipped,
  canMove,
  currentPlayerColor
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);

  // Get all valid moves for the selected piece
  const getValidMovesForSquare = useCallback((square: Square): Square[] => {
    const moves = game.moves({ square, verbose: true });
    return moves.map(move => move.to as Square);
  }, [game]);

  // Handle square click
  const onSquareClick = useCallback((square: Square) => {
    if (!canMove) {
      toast.error('Not your turn');
      return;
    }

    const piece = game.get(square);
    
    // If clicking on a valid move square, make the move
    if (selectedSquare && validMoves.includes(square)) {
      const moveSuccessful = onMove(selectedSquare, square);
      if (moveSuccessful) {
        setSelectedSquare(null);
        setValidMoves([]);
      }
      return;
    }

    // If clicking on a piece of the current player's color
    if (piece && 
        ((piece.color === 'w' && currentPlayerColor === 'white') || 
         (piece.color === 'b' && currentPlayerColor === 'black'))) {
      setSelectedSquare(square);
      const moves = getValidMovesForSquare(square);
      setValidMoves(moves);
      
      if (moves.length === 0) {
        toast.info('No valid moves for this piece');
      }
    } else if (piece && piece.color !== (currentPlayerColor === 'white' ? 'w' : 'b')) {
      toast.error('You can only move your own pieces');
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      // Clicking on empty square or invalid piece
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [selectedSquare, validMoves, canMove, currentPlayerColor, game, onMove]);

  // Create custom square styles for highlighting
  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        boxShadow: 'inset 0 0 0 3px #ffff00'
      };
    }

    // Highlight valid move squares with dots
    validMoves.forEach(square => {
      const piece = game.get(square);
      if (piece) {
        // Target square with enemy piece - red border
        styles[square] = {
          backgroundColor: 'rgba(255, 0, 0, 0.3)',
          boxShadow: 'inset 0 0 0 3px #ff0000'
        };
      } else {
        // Empty target square - green dot
        styles[square] = {
          backgroundImage: `radial-gradient(circle, #00ff00 25%, transparent 25%)`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      }
    });

    return styles;
  }, [selectedSquare, validMoves, game]);

  return (
    <div className="relative">
      <Chessboard
        position={game.fen()}
        onSquareClick={onSquareClick}
        boardOrientation={isFlipped ? 'black' : 'white'}
        arePiecesDraggable={false}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.8)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#374151' }}
        customLightSquareStyle={{ backgroundColor: '#f3f4f6' }}
        animationDuration={200}
      />
      
      {selectedSquare && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-sm text-gray-300 bg-gray-800/80 px-3 py-1 rounded-full">
            Selected: {selectedSquare.toUpperCase()} • {validMoves.length} moves available
          </span>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
