/**
 * todo;
 */
export class MockVector {
  public static DEFAULT_DISTANCE: number = 20;

  public x: number = 0;
  public y: number = 0;
  public z: number = 0;

  /**
   * todo;
   */
  public set(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public distance_to(): number {
    return MockVector.DEFAULT_DISTANCE;
  }
}
