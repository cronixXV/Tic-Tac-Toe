import IGameAI from './IGameAI';
import IGameCell from './IGameCell';
import IGameStatus from './IGameStatus';
export type CellsInLine = 3 | 4 | 5;
export type Player = 'Player' | 'AI';

export interface RoundResult {
  winner: Player;
  winCells: IGameCell[];
}

export default interface IGame {
  aiPlayer: IGameAI;
  player: Player | null;
  status: IGameStatus;
  cellsInLine: CellsInLine;
  checkWin(): RoundResult | boolean | 'Draw';
  newGame: () => void;
  resetStatistics: () => void;
  resizeGameBoard: (size: CellsInLine) => void;
  setStatistics: () => void;
  firstMoveInRound: () => void;
}
