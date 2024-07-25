import IGameCell from './IGameCell';
import { CellsInLine } from './IGame';

interface BoardState {
  columns: IGameCell[][];
  diagonals: IGameCell[][];
  rows: IGameCell[][];
}

export default interface IGameBoard {
  board: HTMLDivElement;
  cells: IGameCell[][];
  cellsInLine: CellsInLine;
  containerElement: HTMLElement;
  generateCells: (size: CellsInLine) => IGameCell[][];
  handleBoardState: () => BoardState;
  handleMove: (event: MouseEvent) => void;
  render: () => void;
}

export type { BoardState };
