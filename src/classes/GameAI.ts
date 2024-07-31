import IGameBoard from '../interfaces/IGameBoard';
import IGame from '../interfaces/IGame';
import { randomInteger } from '../helpers/helpers';
import IGameAI, {
  Disposition,
  SequinceState,
  SequenceStateMetaData,
  BestPlayersMoveData,
} from '../interfaces/IGameAI';
import IGameCell, { CellStatus } from '../interfaces/IGameCell';

export default class GameAI implements IGameAI {
  constructor(
    private readonly gameBoard: IGameBoard,
    private readonly game: IGame,
  ) {
    this.gameBoard = gameBoard;
    this.game = game;
  }
  private handleSequince(sequence: IGameCell[]) {
    const seqPlayerCells = sequence.filter(
      (cell) => cell.getStatus() === this.game.status.playerSym,
    );
    const seqAiCells = sequence.filter(
      (cell) => cell.getStatus() === this.game.status.aiSym,
    );
    const seqEmptyCells = sequence.filter(
      (cell) =>
        cell.getStatus() !== this.game.status.aiSym &&
        cell.getStatus() !== this.game.status.playerSym,
    );

    return {
      seqPlayerCells,
      seqAiCells,
      seqEmptyCells,
    };
  }
  private handleGroup(group: IGameCell[][]) {
    const result: SequinceState[] = [];
    group.forEach((groupSeq) => {
      const seq = this.handleSequince(groupSeq);
      const metaData: SequenceStateMetaData = {
        suggestToHold: true,
      };
      metaData.hasPlayerIn = !!seq.seqPlayerCells.length;
      metaData.hasAiIn = !!seq.seqAiCells.length;
      if (metaData.hasPlayerIn && !metaData.hasAiIn) {
        metaData.suggestToHold = false;
        metaData.movesPlayerToWin = groupSeq.length - seq.seqPlayerCells.length;
      } else if (metaData.hasAiIn && !metaData.hasPlayerIn) {
        metaData.movesAIToWin = groupSeq.length - seq.seqAiCells.length;
      }
      result.push({ seq, metaData });
    });
    return result;
  }
  private checkStates() {
    const { rows, columns, diagonals } = this.gameBoard.handleBoardState();
    const [rowsState, columnsState, diagonalsState] = [
      this.handleGroup(rows),
      this.handleGroup(columns),
      this.handleGroup(diagonals),
    ];
    return { rowsState, columnsState, diagonalsState };
  }
  private checkState(state: SequinceState[]) {
    state = state.filter(Boolean);
    return state;
  }
  private selectTheState(disposition: Disposition) {
    const rowsState = this.checkState(disposition.rowsState);
    const columnsState = this.checkState(disposition.columnsState);
    const diagonalsState = this.checkState(disposition.diagonalsState);

    const moveGroup: { [key: string]: SequinceState[] } = {
      rowsState,
      columnsState,
      diagonalsState,
    };
    return moveGroup;
  }
  private selectTheCell(bestPlayersMoveData: BestPlayersMoveData) {
    if (
      bestPlayersMoveData.bestStepsCountToWinPlayer ===
        bestPlayersMoveData.bestStepsCountToWinAI ||
      bestPlayersMoveData.bestStepsCountToWinPlayer >
        bestPlayersMoveData.bestStepsCountToWinAI
    ) {
      if (bestPlayersMoveData.bestStepsCountToWinAI === -1) {
        return this.getRandomEmptyCell();
      }
      if (bestPlayersMoveData.bestSeqForAI.length === 1) {
        return bestPlayersMoveData.bestSeqForAI[0];
      } else {
        return bestPlayersMoveData.bestSeqForAI[
          randomInteger(0, bestPlayersMoveData.bestSeqForAI.length - 1)
        ];
      }
    } else if (
      bestPlayersMoveData.bestStepsCountToWinPlayer <
      bestPlayersMoveData.bestStepsCountToWinAI
    ) {
      if (bestPlayersMoveData.bestStepsCountToWinPlayer === -1) {
        return this.getRandomEmptyCell();
      }
      if (bestPlayersMoveData.bestSeqForPlayer.length === 1) {
        return bestPlayersMoveData.bestSeqForPlayer[0];
      } else {
        return bestPlayersMoveData.bestSeqForPlayer[
          randomInteger(0, bestPlayersMoveData.bestSeqForPlayer.length - 1)
        ];
      }
    }
    return this.getRandomEmptyCell();
  }
  public getRandomEmptyCell() {
    return (
      this.gameBoard.cells.find(
        (item) => item.getStatus() === CellStatus.empty,
      ) || false
    );
  }
  private selectTheSeq(moveGroup: { [key: string]: SequinceState[] }) {
    let bestStepsCountToWinAI: number = -1;
    let bestSeqForAI: IGameCell[] = [];
    let bestStepsCountToWinPlayer: number = -1;
    let bestSeqForPlayer: IGameCell[] = [];
    for (let groupKey of Object.keys(moveGroup)) {
      moveGroup[groupKey].forEach((range) => {
        if (range.metaData?.movesPlayerToWin) {
          if (
            bestStepsCountToWinPlayer === -1 ||
            range.metaData.movesPlayerToWin < bestStepsCountToWinPlayer
          ) {
            if (range.seq?.seqEmptyCells) {
              bestStepsCountToWinPlayer = range.metaData.movesPlayerToWin;
              bestSeqForPlayer = range.seq?.seqEmptyCells;
            }
          }
        }

        if (range.metaData?.movesAIToWin) {
          if (
            bestStepsCountToWinAI === -1 ||
            range.metaData.movesAIToWin < bestStepsCountToWinAI
          ) {
            if (range.seq?.seqEmptyCells) {
              bestStepsCountToWinAI = range.metaData.movesAIToWin;
              bestSeqForAI = range.seq?.seqEmptyCells;
            }
          }
        }
      });
    }
    return {
      bestStepsCountToWinPlayer,
      bestSeqForPlayer,
      bestStepsCountToWinAI,
      bestSeqForAI,
    };
  }
  move() {
    const disposition = this.checkStates();
    const moveGroup = this.selectTheState(disposition);
    for (let groupKey of Object.keys(moveGroup)) {
      if (moveGroup[groupKey].length) {
        continue;
      }
      delete moveGroup[groupKey];
    }
    const bestPlayersMoveData = this.selectTheSeq(moveGroup);
    const targetCell = this.selectTheCell(bestPlayersMoveData);
    if (targetCell) {
      targetCell.setStatus(this.game.status.aiSym);
    }
  }
}
