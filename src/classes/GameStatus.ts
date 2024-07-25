import { CellStatus } from '../interfaces/IGameCell';
import IGameStatus, { PlayerSym } from '../interfaces/IGameStatus';

type GameStats = {
  aiWins: number;
  playerWins: number;
  draws: number;
};

export default class GameStatus implements IGameStatus {
  public isRunning: boolean;
  public aiSym: PlayerSym;
  public aiWins: number;
  public draws: number;
  public playerWins: number;
  public playerSym: PlayerSym;

  constructor(playerSym: PlayerSym, aiSym: PlayerSym) {
    this.isRunning = false;
    this.aiSym = aiSym;
    this.aiWins = 0;
    this.draws = 0;
    this.playerWins = 0;
    this.playerSym = playerSym;
    this.aiSym = aiSym;
  }

  public startGame(): void {
    this.isRunning = true;
  }

  public stopGame(): void {
    this.isRunning = false;
  }

  public incrementPlayerWins(): void {
    this.playerWins++;
  }

  public incrementAiWins(): void {
    this.aiWins++;
  }

  public incrementDraws(): void {
    this.draws++;
  }

  public getStats(): GameStats {
    return {
      aiWins: this.aiWins,
      playerWins: this.playerWins,
      draws: this.draws,
    };
  }

  public cleanStatistics(): void {
    this.playerWins = 0;
    this.aiWins = 0;
    this.draws = 0;
  }
}
