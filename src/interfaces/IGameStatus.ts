import { CellStatus } from './IGameCell';
type PlayerSym = CellStatus.holdX | CellStatus.holdO;
export default interface IGameStatus {
  isRunning: boolean;
  playerSym: PlayerSym;
  aiSym: PlayerSym;
  playerWins: number;
  aiWins: number;
  draws: number;
  cleanStatistics: () => void;
}
export type { PlayerSym };
