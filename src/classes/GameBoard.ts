import GameCell, { CellStatus } from './GameCell';
import { CellsInLine } from '../interfaces/IGame';
import IGameBoard, { BoardState } from '../interfaces/IGameBoard';

export default class GameBoard implements IGameBoard {
  resize(size: number) {
    throw new Error('Method not implemented.');
  }
  reset() {
    throw new Error('Method not implemented.');
  }
  board: HTMLDivElement;
  cells: GameCell[][];
  cellsInLine: CellsInLine;
  containerElement: HTMLElement;

  constructor(containerElement: HTMLElement, cellsInLine: CellsInLine) {
    this.containerElement = containerElement;
    this.cellsInLine = cellsInLine;
    this.board = document.createElement('div');
    this.board.classList.add('game-board');
    this.cells = this.generateCells(cellsInLine);
    this.render();
  }

  private generateCells(size: CellsInLine): GameCell[][] {
    const cells: GameCell[][] = [];
    for (let i = 0; i < size; i++) {
      const row: GameCell[] = [];
      for (let j = 0; j < size; j++) {
        const cell = new GameCell(i, j);
        row.push(cell);
      }
      cells.push(row);
    }
    return cells;
  }

  private handleCellClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const cell = this.cells.flat().find((cell) => cell.domEl === target);
    if (!cell || cell.status !== CellStatus.empty) {
      return;
    }
    cell.setStatus(this.game.playerSym);
    this.game.makeMove(cell.x, cell.y);
  }

  public handleBoardState(): BoardState {
    const rows: GameCell[][] = this.cells;
    const columns: GameCell[][] = Array.from(
      { length: this.cellsInLine },
      () => [],
    );
    const diagonals: GameCell[][] = [[], []];

    for (let i = 0; i < this.cellsInLine; i++) {
      for (let j = 0; j < this.cellsInLine; j++) {
        columns[j].push(this.cells[i][j]);
        if (i === j) {
          diagonals[0].push(this.cells[i][j]);
        }
        if (i + j === this.cellsInLine - 1) {
          diagonals[1].push(this.cells[i][j]);
        }
      }
    }

    return { rows, columns, diagonals };
  }

  public render(): void {
    this.board.innerHTML = '';
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        this.board.appendChild(cell.domEl);
        cell.domEl.addEventListener('click', this.handleCellClick.bind(this));
      });
    });
    this.containerElement.appendChild(this.board);
  }
}
