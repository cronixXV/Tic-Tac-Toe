import IGameCell, { CellStatus } from '../interfaces/IGameCell';

export default class GameCell implements IGameCell {
  public status: CellStatus = CellStatus.empty;
  public domEl: HTMLDivElement = document.createElement('div');

  constructor(
    public xCoordinate: number,
    public yCoordinate: number,
  ) {
    this.domEl.classList.add('game-cell');
  }

  public getStatus() {
    return this.status;
  }

  setStatus(sym: CellStatus): void {
    if (this.status === CellStatus.empty) {
      this.status = sym;
      this.domEl.classList.add('hold', `hold-${this.status}`);
      this.domEl.textContent = this.status.toString();
    }
  }

  resetStatus(): void {
    if (this.status) {
      this.status = CellStatus.empty;
      this.domEl.classList.remove('hold', `hold-${this.status}`);
      this.domEl.textContent = '';
    }
  }
}
