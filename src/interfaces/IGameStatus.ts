import { CellStatus } from './IGameCell';
export type Player = 'Player' | 'AI';
export type PlayerSym = CellStatus.holdX | CellStatus.holdO;
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
