import IGameAI from './IGameAI';
import IGameCell from './IGameCell';
import IGameStatus from './IGameStatus';

type CellsInLine = 3 | 4 | 5;
type Player = 'Player' | 'AI';

interface RoundResult {
  winner: Player;
  winCells: IGameCell[];
}

export default interface IGame {
  aiPlayer: IGameAI;
  player: Player | null;
  status: IGameStatus;
  cellsInLine: CellsInLine;
  checkWin(): RoundResult | boolean | 'Draw';
  startNewGame(): void;
  resetStatistics(): void;
  resizeGameBoard(size: CellsInLine): void;
  setStatistics(): void;
  firstMoveInRound(): void;
}

export type { RoundResult, CellsInLine, Player };
