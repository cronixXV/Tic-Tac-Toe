import IGameCell, { CellStatus } from '../interfaces/IGameCell';

export default class GameCell implements IGameCell {
  public status: CellStatus = CellStatus.empty;
  public domEl: HTMLDivElement = document.createElement('div');

  constructor(
    public xCoord: number,
    public yCoord: number,
  ) {
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this.domEl.classList.add('game-cell');
  }

  public getStatus() {
    return this.status;
  }

  setStatus(sym: CellStatus) {
    if (this.status === CellStatus.empty) {
      this.status = sym;
      this.domEl.classList.add('hold', `hold-${this.status}`);
      this.domEl.textContent = this.status.toString();
    }
  }

  resetStatus() {
    if (this.status) {
      this.status = CellStatus.empty;
      this.domEl.classList.remove('hold', `hold-${this.status}`);
      this.domEl.textContent = '';
    }
  }
}
