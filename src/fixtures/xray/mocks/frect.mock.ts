/**
 * Mock rectangle class filled with floating points.
 */
export class MockFrect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public set(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
