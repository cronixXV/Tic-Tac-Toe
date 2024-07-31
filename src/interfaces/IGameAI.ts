import IGameCell from './IGameCell';

export default interface IGameAI {
  //метод, который должен выполнять ход AI
  move: () => void;
  //метод, который должен возвращать случайную пустую ячейку на игровом поле.
  getRandomEmptyCell: () => IGameCell | boolean;
}

//данные о последовательности ячеек
type SequenceStateMetaData = {
  suggestToHold: boolean;
  hasAiIn?: boolean;
  hasPlayerIn?: boolean;
  movesAIToWin?: number;
  movesPlayerToWin?: number;
};
//состояние последовательности ячеек.
type SequinceState = {
  metaData?: SequenceStateMetaData;
  seq?: {
    seqAiCells?: IGameCell[];
    seqEmptyCells?: IGameCell[];
    seqPlayerCells?: IGameCell[];
  };
};
//распределение ячеек на игровом поле.
type Disposition = {
  rowsState: SequinceState[];
  columnsState: SequinceState[];
  diagonalsState: SequinceState[];
};

//данные о лучшем ходе игрока.
type BestPlayersMoveData = {
  bestStepsCountToWinAI: number;
  bestSeqForAI: IGameCell[];
  bestStepsCountToWinPlayer: number;
  bestSeqForPlayer: IGameCell[];
};

export type {
  Disposition,
  SequinceState,
  SequenceStateMetaData,
  BestPlayersMoveData,
};
