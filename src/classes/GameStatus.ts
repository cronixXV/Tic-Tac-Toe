import { CellStatus } from '../interfaces/IGameCell';
import IGameStatus, { PlayerSym } from '../interfaces/IGameStatus';

export default class GameStatus implements IGameStatus {
  public isRunning: boolean = false;
  public aiSym: PlayerSym;
  public aiWins: number = 0;
  public draws: number = 0;
  public playerWins: number = 0;
  constructor(public playerSym: PlayerSym) {
    this.playerSym = playerSym;
    this.aiSym = this.setAiSym();
  }
  setAiSym() {
    return (this.aiSym =
      this.playerSym === CellStatus.holdX
        ? CellStatus.holdO
        : CellStatus.holdX);
  }
  public cleanStatistics() {
    this.playerWins = 0;
    this.aiWins = 0;
    this.draws = 0;
  }
  public changePlayerSym() {
    this.playerSym =
      this.playerSym === CellStatus.holdX ? CellStatus.holdO : CellStatus.holdX;
    this.setAiSym();
  }
}
