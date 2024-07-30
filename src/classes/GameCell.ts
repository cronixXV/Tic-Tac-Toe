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
    this.domEl.dataset.x = String(xCoord);
    this.domEl.dataset.y = String(yCoord);
  }

  public getStatus() {
    return this.status;
  }

  setStatus(sym: CellStatus) {
    if (this.status === CellStatus.empty) {
      this.status = sym;
      this.domEl.classList.add('hold', `hold-${this.status}`);
      this.domEl.textContent = this.status.toString();
      console.log('Cell status set to:', this.status);
      console.log('DOM element updated:', this.domEl);
    } else {
      console.log('Cell status is not empty, cannot set status:', this.status);
    }
  }

  resetStatus() {
    if (this.status) {
      this.status = CellStatus.empty;
      this.domEl.classList.remove('hold', `hold-${this.status}`);
      this.domEl.textContent = '';
    }
  }

  public getCoordinates(): { x: number; y: number } {
    return {
      x: Number(this.domEl.dataset.x),
      y: Number(this.domEl.dataset.y),
    };
  }

  public setValue(value: string) {
    this.domEl.textContent = value;
  }
}
