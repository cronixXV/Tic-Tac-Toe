import IGameCell, { CellStatus } from './IGameCell';
export type Player = 'Player' | 'AI';
export type PlayerSym = CellStatus.holdX | CellStatus.holdO;
export default interface IGameStatus {
  getBoardState(): IGameCell[][];
  isRunning: boolean;
  playerSym: PlayerSym;
  aiSym: PlayerSym;
  playerWins: number;
  aiWins: number;
  draws: number;
  cleanStatistics: () => void;
}
