import { CellsInLine } from '../interfaces/IGame';
import { CellStatus } from '../interfaces/IGameCell';
import GameCell from './GameCell';
import IGame from '../interfaces/IGame';
import IGameBoard, { BoardState } from '../interfaces/IGameBoard';
import { RoundResult } from '../interfaces/IGame';

export default class GameBoard implements IGameBoard {
  static hasListenersOnButtons: boolean = false;
  static NEW_GAME_SELECTOR = '#new-game';
  static CLEAN_STATISTICS_SELECTOR = '#clean-statistics';
  static RESIZE_BOARD_FORM_SELECTOR = '.controls__inputs';
  public cells: GameCell[];
  public readonly board: HTMLDivElement = document.createElement('div');
  public boardState: BoardState = {
    rows: [],
    columns: [],
    diagonals: [[], []],
  };

  constructor(
    public readonly containerElement: HTMLElement,
    public readonly cellsInLine: CellsInLine,
    public readonly game: IGame,
  ) {
    this.game = game;
    this.game.firstMoveInRound();
    this.cells = this.genCells(this.cellsInLine);

    this.handleMove = this.handleMove.bind(this);
    this.newGameListener = this.newGameListener.bind(this);
    this.resetGameStatisticsListener =
      this.resetGameStatisticsListener.bind(this);
    this.resizeBoardListener = this.resizeBoardListener.bind(this);
    this.init();
  }
  private removeListeners(): void {
    this.board.removeEventListener('click', this.handleMove);
    document
      .querySelector(GameBoard.NEW_GAME_SELECTOR)
      ?.removeEventListener('click', this.newGameListener);
    document
      .querySelector(GameBoard.CLEAN_STATISTICS_SELECTOR)
      ?.removeEventListener('click', this.resetGameStatisticsListener);
    document
      .querySelector(GameBoard.RESIZE_BOARD_FORM_SELECTOR)
      ?.removeEventListener('submit', this.resizeBoardListener);
    window.removeEventListener('beforeunload', this.removeListeners);
  }
  destroy() {
    this.removeListeners();
  }
  public handleBoardState(): BoardState {
    this.boardState = {
      rows: [],
      columns: [],
      diagonals: [[], []],
    };
    const shiftFactor: number =
      this.cellsInLine === 3 ? 4 : this.cellsInLine === 4 ? 5 : 6;
    for (let itemIdx = 0; itemIdx < this.cellsInLine; itemIdx++) {
      [this.boardState.rows[+itemIdx], this.boardState.columns[+itemIdx]] = [
        [],
        [],
      ];
    }
    // Формирование строк и столбцов для проверки
    for (let cellIdx in this.cells) {
      // Наполнение массива строк
      this.boardState.rows[this.cells[+cellIdx].yCoord].push(
        this.cells[+cellIdx],
      );
      // Наполнение массива столбцов
      this.boardState.columns[this.cells[+cellIdx].xCoord].push(
        this.cells[+cellIdx],
      );
    }
    /*
     * Обе диагонали
     */
    for (
      let diagonalIdx: number = 0,
        revDiagonalIdx: number = this.cellsInLine - 1;
      diagonalIdx < this.cells.length && revDiagonalIdx >= 0;
      diagonalIdx = diagonalIdx + shiftFactor,
        revDiagonalIdx = revDiagonalIdx + shiftFactor - 2
    ) {
      this.boardState.diagonals[0].push(this.cells[diagonalIdx]);
      this.boardState.diagonals[1].push(this.cells[revDiagonalIdx]);
    }
    return this.boardState;
  }

  public genCells(cellsInLine: number): GameCell[] {
    const cells: GameCell[] = [];
    for (let yCoord = 0; yCoord < cellsInLine; yCoord++) {
      for (let xCoord = 0; xCoord < cellsInLine; xCoord++) {
        cells.push(new GameCell(xCoord, yCoord));
      }
    }
    return cells;
  }
  public handleWin(winState: boolean | 'Draw' | RoundResult) {
    this.game.status.isRunning = !this.game.status.isRunning;
    if (winState == 'Draw') {
      this.game.status.draws += 1;
      alert('Ничья');
    } else if (typeof winState !== 'boolean' && winState.winner === 'AI') {
      this.game.status.aiWins += 1;
      alert('Победил Компьютер!');
    } else if (typeof winState !== 'boolean' && winState.winner === 'Player') {
      this.game.status.playerWins += 1;
      alert('Победил Игрок!');
    }
    this.game.setStatistics();
  }
  public handleMove(event: MouseEvent): void {
    const cellIndex: number = Array.from(this.board?.childNodes ?? []).indexOf(
      event.target as HTMLElement,
    );

    if (this.cells[cellIndex].getStatus() !== CellStatus.empty) {
      return;
    }

    this.cells[cellIndex].setStatus(
      this.game.player !== 'AI'
        ? this.game.status.playerSym
        : this.game.status.playerSym === CellStatus.holdX
          ? CellStatus.holdO
          : CellStatus.holdX,
    );

    this.game.player = this.game.player === 'AI' ? 'Player' : 'AI';
    const winState = this.game.checkWin();
    if (winState) {
      this.handleWin(winState);
    } else if (this.game.status.isRunning && this.game.player === 'AI') {
      this.game.player = this.game.player === 'AI' ? 'Player' : 'AI';
      this.game.aiPlayer.move();
      const updatedWinState = this.game.checkWin();
      if (updatedWinState) {
        this.handleWin(updatedWinState);
      }
    }
  }

  public newGameListener(): void {
    this.game.newGame();
  }

  public resetGameStatisticsListener(): void {
    this.game.resetStatistics();
  }

  private resizeBoardListener(event: Event): void {
    event.preventDefault();
    const targetElement = event.target as Element;
    const inputs = targetElement.querySelectorAll(
      'input',
    ) as NodeListOf<HTMLInputElement>;
    if (inputs.length) {
      const sizeValue: number = Number.parseInt(
        // @ts-ignore
        Array.from(inputs).find((input) => input?.checked).value,
        10,
      );
      if (sizeValue === 3 || sizeValue === 4 || sizeValue === 5) {
        this.game.resizeGameBoard(sizeValue);
        this.game.newGame();
      }
    }
  }

  public init(): void {
    this.board?.addEventListener('click', this.handleMove);
    document
      .querySelector(GameBoard.NEW_GAME_SELECTOR)
      ?.addEventListener('click', this.newGameListener);
    document
      .querySelector(GameBoard.CLEAN_STATISTICS_SELECTOR)
      ?.addEventListener('click', this.resetGameStatisticsListener);
    document
      .querySelector(GameBoard.RESIZE_BOARD_FORM_SELECTOR)
      ?.addEventListener('submit', this.resizeBoardListener);
    window.addEventListener('beforeunload', this.removeListeners.bind(this));
  }

  public render(): void {
    this.board.classList.value = 'game-board';
    this.board.innerHTML = '';
    if (this.cellsInLine !== 3) {
      this.board.classList.add(`game-board-${this.cellsInLine}`);
    }
    this.cells.forEach((elem) => {
      if (this.board) {
        this.board.insertAdjacentElement('beforeend', elem.domEl);
      } else {
        alert('Не могу отрисовать игровое поле');
      }
    });
    this.containerElement.insertAdjacentElement('beforeend', this.board);
    this.init();
  }
}
