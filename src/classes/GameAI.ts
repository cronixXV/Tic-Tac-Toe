import IGameCell, { CellStatus } from '../interfaces/IGameCell';
import IGameAI, {
  BoardAnalysis,
  SequenceData,
  SequenceAnalysis,
  BestMoveData,
} from '../interfaces/IGameAI';
import IGameBoard from '../interfaces/IGameBoard';
import Game from './Game';
import { CellsInLine } from '../interfaces/IGame';
import { PlayerCell } from './GameBoard';

export default class GameAI implements IGameAI {
  private board: IGameCell[][];
  public cellsInLine: CellsInLine;
  constructor(
    private gameBoard: IGameBoard,
    private game: Game,
  ) {
    this.cellsInLine = gameBoard.cellsInLine;
    const flatBoard = this.gameBoard.genCells(this.cellsInLine);
    this.board = this.convertTo2DArray(flatBoard, this.cellsInLine);
  }

  private convertTo2DArray(
    flatArray: IGameCell[],
    cellsInLine: number,
  ): IGameCell[][] {
    const board: IGameCell[][] = [];
    for (let i = 0; i < cellsInLine; i++) {
      const row: IGameCell[] = [];
      for (let j = 0; j < cellsInLine; j++) {
        row.push(flatArray[i * cellsInLine + j]);
      }
      board.push(row);
    }
    return board;
  }

  // public printBoard(): void {
  //   console.log('Currentboardstate:');
  //   for (const row of this.board) {
  //     console.log(row.map((cell) => cell.getStatus()).join(' '));
  //   }
  // }
  public move(): void {
    console.log('AI is making a move...');
    const bestMoveData = this.getBestMove();
    if (bestMoveData) {
      const bestCell =
        bestMoveData.bestSeqForAI[
          Math.floor(bestMoveData.bestSeqForAI.length / 2)
        ];
      bestCell.setStatus(CellStatus.holdO);
      console.log('AI made a move:', bestCell);
      // После хода AI нужно снова проверить победу и сменить текущего игрока
      const gameResult = this.game.checkWin();
      if (gameResult === false) {
        this.game.setCurrentPlayer('Player');
      } else {
        this.game.handleGameResult(gameResult);
      }
    } else {
      console.log('No best move found for AI');
      const randomCell = this.getRandomEmptyCell();
      if (randomCell && typeof randomCell !== 'boolean') {
        randomCell.setStatus(CellStatus.holdO);
        console.log('AI made a random move:', randomCell);
        // После хода AI нужно снова проверить победу и сменить текущего игрока
        const gameResult = this.game.checkWin();
        if (gameResult === false) {
          this.game.setCurrentPlayer('Player');
        } else {
          this.game.handleGameResult(gameResult);
        }
      } else {
        console.log('No empty cells found for AI to make a move');
      }
    }
  }

  public getRandomEmptyCell(): IGameCell | boolean {
    const emptyCells = this.board
      .flat()
      .filter((cell) => cell.getStatus() === CellStatus.empty);
    console.log('Empty cells found:', emptyCells);
    if (!emptyCells.length) {
      console.log('No empty cells found');
      return false;
    }
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const randomCell = emptyCells[randomIndex];
    console.log('Random empty cell selected:', randomCell);
    return randomCell;
  }

  private getBoardAnalysis(): BoardAnalysis {
    const rowsState: SequenceData[] = [];
    const columnsState: SequenceData[] = [];
    const diagonalsState: SequenceData[] = [];

    const boardState = this.gameBoard.handleBoardState();
    const board = boardState.board;

    // Функция для преобразования PlayerCell в CellStatus
    const convertToCellStatus = (cell: PlayerCell): CellStatus => {
      switch (cell) {
        case 'X':
          return CellStatus.holdX;
        case 'O':
          return CellStatus.holdO;
        default:
          return CellStatus.empty;
      }
    };

    // Функция для создания объекта IGameCell
    const createGameCell = (
      x: number,
      y: number,
      status: CellStatus,
    ): IGameCell => {
      return {
        domEl: document.createElement('div'),
        xCoord: x,
        yCoord: y,
        status: status,
        getStatus: () => status,
        setStatus: (newStatus: CellStatus) => {
          status = newStatus;
        },
        resetStatus: () => {
          status = CellStatus.empty;
        },
      };
    };

    // Проверка строк
    for (let i = 0; i < board.length; i++) {
      const row: IGameCell[] = board[i].map((cell, x) =>
        createGameCell(x, i, convertToCellStatus(cell)),
      );
      rowsState.push(this.getSequenceData(row));
    }

    // Проверка столбцов
    for (let i = 0; i < board.length; i++) {
      const column: IGameCell[] = board.map((row, y) =>
        createGameCell(i, y, convertToCellStatus(row[i])),
      );
      columnsState.push(this.getSequenceData(column));
    }

    // Проверка диагоналей
    const mainDiagonal: IGameCell[] = [];
    const antiDiagonal: IGameCell[] = [];
    for (let i = 0; i < board.length; i++) {
      mainDiagonal.push(createGameCell(i, i, convertToCellStatus(board[i][i])));
      antiDiagonal.push(
        createGameCell(
          i,
          board.length - 1 - i,
          convertToCellStatus(board[i][board.length - 1 - i]),
        ),
      );
    }
    diagonalsState.push(this.getSequenceData(mainDiagonal));
    diagonalsState.push(this.getSequenceData(antiDiagonal));

    console.log('Board analysis:', { rowsState, columnsState, diagonalsState });

    return { rowsState, columnsState, diagonalsState };
  }

  private getSequenceData(sequence: IGameCell[]): SequenceData {
    if (!Array.isArray(sequence)) {
      throw new Error('sequence is not an array');
    }
    const sequenceAnalysis: SequenceAnalysis = {
      suggestToHold: false,
      hasAiIn: sequence.some((cell) => cell.getStatus() === CellStatus.holdO),
      hasPlayerIn: sequence.some(
        (cell) => cell.getStatus() === CellStatus.holdX,
      ),
      movesAIToWin: 0,
      movesPlayerToWin: 0,
    };

    const seqAiCells: IGameCell[] = [];
    const seqEmptyCells: IGameCell[] = [];
    const seqPlayerCells: IGameCell[] = [];

    for (const cell of sequence) {
      if (cell.getStatus() === CellStatus.empty) {
        seqEmptyCells.push(cell);
      } else if (cell.getStatus() === CellStatus.holdO) {
        seqAiCells.push(cell);
      } else {
        seqPlayerCells.push(cell);
      }
    }

    if (seqAiCells.length === 2 && seqEmptyCells.length === 1) {
      sequenceAnalysis.suggestToHold = true;
      sequenceAnalysis.movesAIToWin = 1;
    } else if (seqAiCells.length === 1 && seqEmptyCells.length === 2) {
      sequenceAnalysis.suggestToHold = true;
      sequenceAnalysis.movesAIToWin = 2;
    } else if (seqPlayerCells.length === 2 && seqEmptyCells.length === 1) {
      sequenceAnalysis.movesPlayerToWin = 1;
    } else if (seqPlayerCells.length === 1 && seqEmptyCells.length === 2) {
      sequenceAnalysis.movesPlayerToWin = 2;
    }

    console.log('Sequence analysis:', sequenceAnalysis);
    console.log('Sequence cells:', {
      seqAiCells,
      seqEmptyCells,
      seqPlayerCells,
    });

    return {
      metaData: sequenceAnalysis,
      seq: {
        seqAiCells,
        seqEmptyCells,
        seqPlayerCells,
      },
    };
  }

  private getBestMove(): BestMoveData | null {
    console.log('Getting best move for AI...');
    const boardAnalysis = this.getBoardAnalysis();
    let bestMoveData: BestMoveData | null = null;

    for (const rowState of boardAnalysis.rowsState) {
      if (rowState.metaData?.suggestToHold) {
        if (rowState.metaData && rowState.metaData.movesAIToWin) {
          bestMoveData = {
            bestStepsCountToWinAI: rowState.metaData.movesAIToWin,
            bestSeqForAI: rowState.seq?.seqEmptyCells || [],
            bestStepsCountToWinPlayer: 0,
            bestSeqForPlayer: [],
          };
          console.log('Best move found in row:', bestMoveData);
          break; // Если нашли лучший ход, можно прекратить поиск
        }
      }
    }

    if (!bestMoveData) {
      for (const columnState of boardAnalysis.columnsState) {
        if (columnState.metaData?.suggestToHold) {
          if (
            columnState.metaData &&
            columnState.metaData.movesAIToWin !== undefined
          ) {
            bestMoveData = {
              bestStepsCountToWinAI: columnState.metaData.movesAIToWin,
              bestSeqForAI: columnState.seq?.seqEmptyCells || [],
              bestStepsCountToWinPlayer: 0,
              bestSeqForPlayer: [],
            };
            console.log('Best move found in column:', bestMoveData);
            break; // Если нашли лучший ход, можно прекратить поиск
          }
        }
      }
    }

    if (!bestMoveData) {
      for (const diagonalState of boardAnalysis.diagonalsState) {
        if (diagonalState.metaData?.suggestToHold) {
          if (diagonalState.metaData?.movesAIToWin) {
            bestMoveData = {
              bestStepsCountToWinAI: diagonalState.metaData.movesAIToWin,
              bestSeqForAI: diagonalState.seq?.seqEmptyCells || [],
              bestStepsCountToWinPlayer: 0,
              bestSeqForPlayer: [],
            };
            console.log('Best move found in diagonal:', bestMoveData);
            break; // Если нашли лучший ход, можно прекратить поиск
          }
        }
      }
    }

    if (!bestMoveData) {
      const emptyCell = this.getRandomEmptyCell() as IGameCell;
      if (emptyCell) {
        bestMoveData = {
          bestStepsCountToWinAI: 0,
          bestSeqForAI: [emptyCell],
          bestStepsCountToWinPlayer: 0,
          bestSeqForPlayer: [],
        };
        console.log('Random move selected:', bestMoveData);
      } else {
        console.log('No best move found for AI');
      }
    }

    console.log('Best move for AI:', bestMoveData);
    return bestMoveData;
  }
}
