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

export default class GameAI implements IGameAI {
  private board: IGameCell[][];
  public cellsInLine: CellsInLine;
  constructor(
    private gameBoard: IGameBoard,
    private game: Game,
  ) {
    this.cellsInLine = gameBoard.cellsInLine;
    this.board = gameBoard.genCells(this.cellsInLine);
  }

  public move(): void {
    const bestMoveData = this.getBestMove();
    if (bestMoveData) {
      const bestCell =
        bestMoveData.bestSeqForAI[
          Math.floor(bestMoveData.bestSeqForAI.length / 2)
        ];
      bestCell.setStatus(CellStatus.holdO);
    }
  }

  public getRandomEmptyCell(): IGameCell | boolean {
    const emptyCells = this.board
      .flat()
      .filter((cell) => cell.getStatus() === CellStatus.empty);
    if (!emptyCells.length) {
      return false;
    }
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  private getBoardAnalysis(): BoardAnalysis {
    const rowsState: SequenceData[] = [];
    const columnsState: SequenceData[] = [];
    const diagonalsState: SequenceData[] = [];

    for (let i = 0; i < this.board.length; i++) {
      const row: IGameCell[] = this.board[i];
      const column: IGameCell[] = this.board.map((r) => r[i]);
      rowsState.push(this.getSequenceData(row));
      columnsState.push(this.getSequenceData(column));
    }

    const mainDiagonal: IGameCell[] = [];
    const antiDiagonal: IGameCell[] = [];
    for (let i = 0; i < this.board.length; i++) {
      mainDiagonal.push(this.board[i][i]);
      antiDiagonal.push(this.board[i][this.board.length - i - 1]);
    }
    diagonalsState.push(this.getSequenceData(mainDiagonal));
    diagonalsState.push(this.getSequenceData(antiDiagonal));

    return { rowsState, columnsState, diagonalsState };
  }

  private getSequenceData(sequence: IGameCell[]): SequenceData {
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

    let currentSeq: IGameCell[] = [];
    let currentSeqType: 'ai' | 'empty' | 'player' = 'empty';

    for (const cell of sequence) {
      if (cell.getStatus() === CellStatus.empty) {
        if (currentSeqType === 'empty') {
          currentSeq.push(cell);
        } else {
          seqEmptyCells.push(...currentSeq);
          currentSeq = [cell];
          currentSeqType = 'empty';
        }
      } else if (cell.getStatus() === CellStatus.holdO) {
        if (currentSeqType === 'ai') {
          currentSeq.push(cell);
        } else {
          seqAiCells.push(...currentSeq);
          currentSeq = [cell];
          currentSeqType = 'ai';
        }
      } else {
        if (currentSeqType === 'player') {
          currentSeq.push(cell);
        } else {
          seqPlayerCells.push(...currentSeq);
          currentSeq = [cell];
          currentSeqType = 'player';
        }
      }
    }

    if (currentSeqType === 'ai') {
      seqAiCells.push(...currentSeq);
    } else if (currentSeqType === 'player') {
      seqPlayerCells.push(...currentSeq);
    } else {
      seqEmptyCells.push(...currentSeq);
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
        }
      }
    }

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
        }
      }
    }

    for (const diagonalState of boardAnalysis.diagonalsState) {
      if (diagonalState.metaData?.suggestToHold) {
        if (diagonalState.metaData?.movesAIToWin) {
          bestMoveData = {
            bestStepsCountToWinAI: diagonalState.metaData.movesAIToWin,
            bestSeqForAI: diagonalState.seq?.seqEmptyCells || [],
            bestStepsCountToWinPlayer: 0,
            bestSeqForPlayer: [],
          };
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
      }
    }

    return bestMoveData;
  }
}
