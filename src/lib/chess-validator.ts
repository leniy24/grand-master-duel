// Types for chess piece positions
export interface ChessPosition {
  x: number;
  y: number;
}

/**
 * Validates if a position is within the chess board boundaries
 * @param position The position to validate
 * @returns boolean indicating if the position is valid
 */
export function isValidPosition(position: ChessPosition): boolean {
  // Check if position values are numbers
  if (typeof position.x !== 'number' || typeof position.y !== 'number') {
    return false;
  }

  // Check if position values are integers
  if (!Number.isInteger(position.x) || !Number.isInteger(position.y)) {
    return false;
  }

  // Check if position is within board boundaries (0-7)
  return position.x >= 0 && position.x <= 7 && position.y >= 0 && position.y <= 7;
}

/**
 * Validates multiple chess piece positions
 * @param positions Array of positions to validate
 * @returns boolean indicating if all positions are valid
 */
export function validatePiecePositions(positions: ChessPosition[]): boolean {
  // Check if input is an array
  if (!Array.isArray(positions)) {
    return false;
  }

  // Check if array is empty
  if (positions.length === 0) {
    return false;
  }

  // Check each position
  return positions.every(isValidPosition);
}

/**
 * Converts algebraic notation (e.g., "e4") to coordinates
 * @param algebraic The algebraic notation position
 * @returns ChessPosition object with x,y coordinates
 */
export function algebraicToPosition(algebraic: string): ChessPosition | null {
  if (typeof algebraic !== 'string' || algebraic.length !== 2) {
    return null;
  }

  const file = algebraic.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(algebraic[1]) - 1;

  const position = { x: file, y: rank };
  return isValidPosition(position) ? position : null;
}

/**
 * Converts coordinates to algebraic notation
 * @param position The position in coordinates
 * @returns string in algebraic notation or null if invalid
 */
export function positionToAlgebraic(position: ChessPosition): string | null {
  if (!isValidPosition(position)) {
    return null;
  }

  const file = String.fromCharCode('a'.charCodeAt(0) + position.x);
  const rank = position.y + 1;
  return `${file}${rank}`;
}