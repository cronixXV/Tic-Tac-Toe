import IGameCell, { CellStatus } from '../interfaces/IGameCell';
import IGame, { CellsInLine, Player, RoundResult } from '../interfaces/IGame';
import GameBoard, { PlayerCell } from './GameBoard';
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
  private currentPlayer: Player = 'Player';

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

  public isPlayer(): boolean {
    return this.player === 'Player';
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
    this.status.cleanStatistics(); // Сброс статистики
    this.gameBoard.render();
    this.firstMoveInRound();
  }

  public handleMove(cell: IGameCell): void {
    if (this.getCurrentPlayer() === this.player) {
      cell.setStatus(CellStatus.holdX);
      this.setCurrentPlayer('AI');
      const result = this.checkWin();
      if (result === false) {
        console.log('AI should make a move now.');
        this.aiPlayer.move();
      } else {
        this.handleGameResult(result);
      }
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

  private checkWinner(state: PlayerCell[][]): RoundResult | false {
    for (let sequenceIdx in state) {
      let checkValue = state[sequenceIdx][0];
      const convertedCheckValue = this.convertToCellStatus(checkValue);
      if (
        convertedCheckValue !== CellStatus.empty &&
        state[sequenceIdx].every(
          (cell) => this.convertToCellStatus(cell) === convertedCheckValue,
        )
      ) {
        const winCells: IGameCell[] = state[sequenceIdx].map((cell, index) => ({
          domEl: document.createElement('div'), // Пример, замените на реальный элемент
          xCoord: index,
          yCoord: parseInt(sequenceIdx),
          status: this.convertToCellStatus(cell),
          getStatus: () => this.convertToCellStatus(cell),
          setStatus: (newStatus: CellStatus) => {
            // Логика установки статуса
          },
          resetStatus: () => {
            // Логика сброса статуса
          },
        }));
        return {
          winner:
            this.status.playerSym === convertedCheckValue ? 'Player' : 'AI',
          winCells: winCells,
        };
      }
    }
    return false;
  }

  private convertToCellStatus(cell: PlayerCell): CellStatus {
    switch (cell) {
      case 'X':
        return CellStatus.holdX;
      case 'O':
        return CellStatus.holdO;
      default:
        return CellStatus.empty;
    }
  }

  private hasCollectionsNotEmptySequences(state: PlayerCell[][]): boolean {
    return state.some((cells) =>
      cells.every(
        (cell) => this.convertToCellStatus(cell) !== CellStatus.empty,
      ),
    );
  }

  private checkHorizontal(board: PlayerCell[][]): RoundResult | false {
    return this.checkWinner(board);
  }

  private checkVertical(board: PlayerCell[][]): RoundResult | false {
    const columns: PlayerCell[][] = Array(board.length)
      .fill(null)
      .map(() => Array(board.length).fill(null));

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        columns[j][i] = board[i][j];
      }
    }

    return this.checkWinner(columns);
  }

  private checkDiagonal(board: PlayerCell[][]): RoundResult | false {
    const mainDiagonal: PlayerCell[] = [];
    const antiDiagonal: PlayerCell[] = [];

    for (let i = 0; i < board.length; i++) {
      mainDiagonal.push(board[i][i]);
      antiDiagonal.push(board[i][board.length - 1 - i]);
    }

    const diagonals: PlayerCell[][] = [mainDiagonal, antiDiagonal];
    return this.checkWinner(diagonals);
  }

  private checkDraw(board: PlayerCell[][]): boolean | 'Draw' {
    return this.hasCollectionsNotEmptySequences(board) ? 'Draw' : false;
  }

  public checkWin(): RoundResult | boolean | 'Draw' {
    const boardState = this.gameBoard.handleBoardState();
    const board = boardState.board;

    // Проверка строк
    const winByRows = this.checkHorizontal(board);
    if (winByRows) {
      return winByRows;
    }

    // Проверка столбцов
    const winByColumns = this.checkVertical(board);
    if (winByColumns) {
      return winByColumns;
    }

    // Проверка диагоналей
    const winByDiagonals = this.checkDiagonal(board);
    if (winByDiagonals) {
      return winByDiagonals;
    }

    // Проверка на ничью
    const isDraw = this.checkDraw(board);
    if (isDraw) {
      return 'Draw';
    }

    return false;
  }

  public firstMoveInRound(): void {
    this.player = Math.random() < 0.5 ? 'AI' : 'Player';
    console.log('Первый ход в раунде:', this.player);
    this.currentPlayer = this.player;
    if (this.player === 'AI') {
      this.aiPlayer.move();
    }
  }

  public handleGameResult(result: RoundResult | boolean | 'Draw'): void {
    if (result === 'Draw') {
      console.log('Draw!');
      // Обработка ничьей
    } else if (result && typeof result === 'object' && 'winner' in result) {
      console.log(`${result.winner} wins!`);
      // Обработка победы
      if (result.winner === 'Player') {
        this.status.playerWins++;
      } else if (result.winner === 'AI') {
        this.status.aiWins++;
      }
      this.setStatistics();
    }
    this.status.isRunning = false;
    this.newGame(); // Начать новую игру
  }

  public getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  public setCurrentPlayer(player: Player): void {
    this.currentPlayer = player;
  }
}
