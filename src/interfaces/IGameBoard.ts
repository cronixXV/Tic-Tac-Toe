import IGame, { CellsInLine } from './IGame';
import IGameCell from './IGameCell';

type PlayerCell = 'X' | 'O' | null;

interface BoardState {
  board: PlayerCell[][];
}

export default interface IGameBoard {
  handleWin(
    winState: string | boolean | import('./IGame').RoundResult,
  ): unknown;
  board: HTMLDivElement;
  boardState: BoardState;
  cells: IGameCell[];
  cellsInLine: CellsInLine;
  containerElement: HTMLElement;
  game: IGame;
  genCells: (size: CellsInLine) => IGameCell[];
  handleBoardState: () => BoardState;
  handleMove: (event: MouseEvent) => void;
  render: () => void;
}

export type { BoardState };
