enum CellStatus {
  empty = 0,
  holdX = 'X',
  holdO = 'O',
}

export default interface IGameCell {
  domEl: HTMLDivElement;
  xCoordinate: number;
  yCoordinate: number;
  status: CellStatus;
  getStatus(): CellStatus;
  setStatus(sym: CellStatus): void;
  resetStatus(): void;
}
export { CellStatus };
