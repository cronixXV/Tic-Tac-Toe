import IGameCell, { CellStatus } from '../interfaces/IGameCell';

export default class GameCell implements IGameCell {
  public status: CellStatus = CellStatus.empty;
  public domEl: HTMLDivElement;

  constructor(
    public xCoordinate: number,
    public yCoordinate: number,
  ) {
    this.xCoordinate = xCoordinate;
    this.yCoordinate = yCoordinate;
    this.domEl = document.createElement('div');
    this.domEl.classList.add('game-cell');
  }
  setStatistics(empty: CellStatus): unknown {
    throw new Error('Method not implemented.');
  }

  public getStatus(): CellStatus {
    return this.status;
  }

  public setStatus(sym: CellStatus): void {
    if (this.status === CellStatus.empty) {
      this.status = sym;
      this.domEl.classList.add('hold', `hold-${this.status}`);
      this.domEl.textContent = this.status.toString();
    }
  }

  public resetStatus(): void {
    if (this.status !== CellStatus.empty) {
      this.status = CellStatus.empty;
      this.domEl.classList.remove('hold', `hold-${this.status}`);
      this.domEl.textContent = '';
    }
  }
}
