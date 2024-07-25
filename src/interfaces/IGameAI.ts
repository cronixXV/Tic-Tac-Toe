import IGameCell from './IGameCell';

export default interface IGameAI {
  //метод, который должен выполнять ход AI
  move: () => void;
  //метод, который должен возвращать случайную пустую ячейку на игровом поле.
  getRandomEmptyCell: () => IGameCell | boolean;
}

//данные о последовательности ячеек
type SequenceAnalysis = {
  suggestToHold: boolean;
  hasAiIn?: boolean;
  hasPlayerIn?: boolean;
  movesAIToWin?: number;
  movesPlayerToWin?: number;
};
//состояние последовательности ячеек.
type SequenceData = {
  metaData?: SequenceAnalysis;
  seq?: {
    seqAiCells?: IGameCell[];
    seqEmptyCells?: IGameCell[];
    seqPlayerCells?: IGameCell[];
  };
};
//распределение ячеек на игровом поле.
type BoardAnalysis = {
  rowsState: SequenceData[];
  columnsState: SequenceData[];
  diagonalsState: SequenceData[];
};

//данные о лучшем ходе игрока.
type BestMoveData = {
  bestStepsCountToWinAI: number;
  bestSeqForAI: IGameCell[];
  bestStepsCountToWinPlayer: number;
  bestSeqForPlayer: IGameCell[];
};
export type { BoardAnalysis, SequenceData, SequenceAnalysis, BestMoveData };
