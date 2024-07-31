import IGameCell, { CellStatus } from '../interfaces/IGameCell';
import IGame, { CellsInLine, Player, RoundResult } from '../interfaces/IGame';
import GameBoard from './GameBoard';
import GameStatus from './GameStatus';
import IGameBoard from '../interfaces/IGameBoard';
import IGameStatus, { PlayerSym } from '../interfaces/IGameStatus';
import IGameAI from '../interfaces/IGameAI';
import GameAI from './GameAI';

export default class Game implements IGame {
  private gameBoard: IGameBoard;
  public player: Player | null = null;
  public readonly status: IGameStatus;
  public aiPlayer: IGameAI;
  constructor(
    private readonly containerElement: HTMLElement,
    public cellsInLine: CellsInLine,
    public readonly playerSym: PlayerSym = CellStatus.holdX,
  ) {
    this.gameBoard = new GameBoard(
      this.containerElement,
      this.cellsInLine,
      this,
    );
    this.status = new GameStatus(playerSym);
    this.aiPlayer = new GameAI(this.gameBoard, this);
    this.firstMoveInRound();
  }

  public newGame(): void {
    this.gameBoard.containerElement.innerHTML = '';
    this.gameBoard.cells.forEach((cell) => {
      cell.resetStatus();
    });
    this.gameBoard.board.removeEventListener(
      'click',
      this.gameBoard.handleMove,
    );
    this.status.isRunning = true;
    this.gameBoard.render();
    if (this.player === 'AI') {
      this.player = this.player === 'AI' ? 'Player' : 'AI';
      this.aiPlayer.move();
      this.gameBoard.handleBoardState();
    }
  }
  public resizeGameBoard(size: CellsInLine) {
    this.cellsInLine = size;
    this.gameBoard.cellsInLine = this.cellsInLine;
    this.gameBoard.cells = this.gameBoard.genCells(size);
    this.gameBoard.render();
  }
  public setStatistics() {
    const PLAYER_SELECTOR = '[data-player="player"] > .statistics__value';
    const AI_SELECTOR = '[data-player="AI"] > .statistics__value';
    const playerStatElem = document.querySelector(`${PLAYER_SELECTOR}`);
    const aiStatElem = document.querySelector(`${AI_SELECTOR}`);
    if (playerStatElem !== null) {
      playerStatElem.innerHTML = (this.status.playerWins as Number).toString();
    }
    if (aiStatElem !== null) {
      aiStatElem.innerHTML = (this.status.aiWins as Number).toString();
    }
  }
  public resetStatistics(): void {
    const playerStatElem = document.querySelector(
      '[data-player="player"] > .statistics__value',
    );
    const aiStatElem = document.querySelector(
      '[data-player="AI"] > .statistics__value',
    );

    this.status.cleanStatistics();
    (playerStatElem as HTMLElement).innerHTML = `${this.status.playerWins}`;
    (aiStatElem as HTMLElement).innerHTML = `${this.status.aiWins}`;
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
    const hasNoEmptyColumns = this.hasCollectionsNotEmptySequences(state);
    return hasNoEmptyColumns ? this.checkWinner(state) : false;
  }

  private checkDiagonal(state: IGameCell[][]): RoundResult | false {
    const hasNoEmptyDiagonals = this.hasCollectionsNotEmptySequences(state);
    return hasNoEmptyDiagonals ? this.checkWinner(state) : false;
  }

  private checkDraw(): boolean | 'Draw' {
    return this.hasCollectionsNotEmptySequences([this.gameBoard.cells])
      ? 'Draw'
      : false;
  }

  public checkWin(): RoundResult | boolean | 'Draw' {
    const boardState = this.gameBoard.handleBoardState();
    const winByRows = this.checkHorizontal(boardState.rows);
    const winByColumns = this.checkVertical(boardState.columns);
    const winByDiagonals = this.checkDiagonal(boardState.diagonals);
    const isDraw = this.checkDraw();
    return winByRows || winByColumns || winByDiagonals || isDraw;
  }

  public firstMoveInRound(): void {
    this.player = Math.random() < 0.5 ? 'AI' : 'Player';
  }
}
