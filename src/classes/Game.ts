import IGameAI from '../interfaces/IGameAI';
import IGameCell from '../interfaces/IGameCell';
import IGameStatus from '../interfaces/IGameStatus';
import GameBoard, { BoardState } from './GameBoard';
import GameStatus from './GameStatus';
import { CellStatus } from '../interfaces/IGameCell';
import { PlayerSym } from '../interfaces/IGameStatus';
import { CellsInLine } from '../interfaces/IGame';
import IGame from '../interfaces/IGame';
import { Player } from '../interfaces/IGameStatus';

export default class Game implements IGame {
  aiPlayer: IGameAI;
  player: Player | null = null;
  status: IGameStatus;
  gameBoard: GameBoard;
  aiSym: PlayerSym;

  constructor(
    containerElement: HTMLElement,
    cellsInLine: CellsInLine,
    playerSym: PlayerSym = CellStatus.holdX,
  ) {
    this.gameBoard = new GameBoard(containerElement, cellsInLine);
    this.status = new GameStatus(playerSym, CellStatus.holdO);
    this.aiSym = CellStatus.holdO;
    this.aiPlayer = new IGameAI(this.gameBoard, this);
    this.setStatistics();
    this.firstMoveInRound();
  }

  public newGame(): void {
    this.gameBoard.reset();
    this.status.startGame();
    this.status.cleanStatistics();
    this.setStatistics();

    if (this.status.aiSym === this.status.playerSym) {
      this.status.playerSym =
        this.status.playerSym === CellStatus.holdX
          ? CellStatus.holdO
          : CellStatus.holdX;
      this.checkGameStatus();
    }
  }

  public resizeGameBoard(size: CellsInLine): void {
    this.gameBoard.resize(size);
  }

  public setStatistics(): void {
    const PLAYER_SELECTOR = '[data-player="player"] > .statistics__value';
    const AI_SELECTOR = '[data-player="AI"] > .statistics__value';
    const playerStatElem = document.querySelector(
      PLAYER_SELECTOR,
    ) as HTMLElement;
    const aiStatElem = document.querySelector(AI_SELECTOR) as HTMLElement;

    if (playerStatElem !== null) {
      playerStatElem.innerHTML = this.status.playerWins.toString();
    }
    if (aiStatElem !== null) {
      aiStatElem.innerHTML = this.status.aiWins.toString();
    }
  }

  public resetStatistics(): void {
    const playerStatElem = document.querySelector(
      '[data-player="player"] > .statistics__value',
    ) as HTMLElement;
    const aiStatElem = document.querySelector(
      '[data-player="AI"] > .statistics__value',
    ) as HTMLElement;

    this.status.cleanStatistics();
    playerStatElem.innerHTML = this.status.playerWins.toString();
    aiStatElem.innerHTML = this.status.aiWins.toString();
  }

  private checkWinner(state: IGameCell[][]): RoundResult | false {
    for (let sequenceIdx in state) {
      let checkValue = state[sequenceIdx][0].getStatus();
      if (
        checkValue !== CellStatus.empty &&
        state[sequenceIdx].every((cell) => cell.getStatus() === checkValue)
      ) {
        return {
          winner: this.status.playerSym === checkValue ? 'Player' : 'AI',
          winCells: state[sequenceIdx],
        };
      }
    }
    return false;
  }

  private hasCollectionsNotEmptySequences(state: IGameCell[][]): boolean {
    return state.some((cells) =>
      cells.every((cell) => cell.getStatus() !== CellStatus.empty),
    );
  }

  private checkHorizontal(state: IGameCell[][]): RoundResult | false {
    const hasNoEmptyRows = this.hasCollectionsNotEmptySequences(state);
    return hasNoEmptyRows ? this.checkWinner(state) : false;
  }

  private checkVertical(state: IGameCell[][]): RoundResult | false {
    const transposedState = state[0].map((_, colIndex) =>
      state.map((row) => row[colIndex]),
    );
    const hasNoEmptyColumns =
      this.hasCollectionsNotEmptySequences(transposedState);
    return hasNoEmptyColumns ? this.checkWinner(transposedState) : false;
  }

  private checkDiagonal(state: IGameCell[][]): RoundResult | false {
    const leftDiagonal = state.map((row, index) => row[index]);
    const rightDiagonal = state.map(
      (row, index) => row[state.length - 1 - index],
    );
    const diagonals = [leftDiagonal, rightDiagonal];

    const hasNoEmptyDiagonals = this.hasCollectionsNotEmptySequences(diagonals);
    return hasNoEmptyDiagonals ? this.checkWinner(diagonals) : false;
  }

  private checkDraw(): boolean | 'Draw' {
    const allCells = this.gameBoard.cells.flat();
    const hasEmptyCell = allCells.some(
      (cell) => cell.getStatus() === CellStatus.empty,
    );
    return hasEmptyCell ? false : 'Draw';
  }

  private checkGameStatus(): void {
    const boardState = this.gameBoard.handleBoardState();
    const winByRows = this.checkHorizontal(boardState.rows);
    const winByColumns = this.checkVertical(boardState.columns);
    const winByDiagonals = this.checkDiagonal(boardState.diagonals);
    const isDraw = this.checkDraw();

    if (winByRows) {
      this.status.updateStatistics(winByRows.winner);
      this.status.endGame(winByRows.winner);
      winByRows.winCells.forEach((cell) => cell.setWin());
      return;
    }
    if (winByColumns) {
      this.status.updateStatistics(winByColumns.winner);
      this.status.endGame(winByColumns.winner);
      winByColumns.winCells.forEach((cell) => cell.setWin());
      return;
    }
    if (winByDiagonals) {
      this.status.updateStatistics(winByDiagonals.winner);
      this.status.endGame(winByDiagonals.winner);
      winByDiagonals.winCells.forEach((cell) => cell.setWin());
      return;
    }
    if (isDraw) {
      this.status.endGame('Draw');
      return;
    }

    this.status.nextRound();
    this.firstMoveInRound();
  }

  private firstMoveInRound(): void {
    this.status.playerSym =
      Math.random() < 0.5 ? CellStatus.holdX : CellStatus.holdO;
    this.status.aiSym =
      this.status.playerSym === CellStatus.holdX
        ? CellStatus.holdO
        : CellStatus.holdX;
    this.player = this.status.playerSym === this.status.aiSym ? 'AI' : 'Player';
  }
}
