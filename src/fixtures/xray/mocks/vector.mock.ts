/**
 * todo;
 */
export class MockVector {
  public static DEFAULT_DISTANCE: number = 20;

  public x: number = 0;
  public y: number = 0;
  public z: number = 0;

  /**
   * todo: Description.
   */
  public set(x: number, y: number, z: number): MockVector {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  public distance_to(): number {
    return MockVector.DEFAULT_DISTANCE;
  }
}
