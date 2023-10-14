/**
 * Mock rectangle class filled with coordinates.
 */
export class MockFrect {
  public x1: number;
  public y1: number;
  public x2: number;
  public y2: number;

  public constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  public set(x1: number, y1: number, x2: number, y2: number): MockFrect {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    return this;
  }
}
