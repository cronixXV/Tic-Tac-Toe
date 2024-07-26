import IGame, { CellsInLine } from './IGame';
import IGameCell from './IGameCell';

interface BoardState {
  columns: IGameCell[][];
  diagonals: IGameCell[][];
  rows: IGameCell[][];
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
