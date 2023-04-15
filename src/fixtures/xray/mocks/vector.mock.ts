import { XR_vector } from "xray16";

/**
 * todo;
 */
export class MockVector {
  /**
   * Create mock vector from coordinates.
   */
  public static create(x: number = 0, y: number = 0, z: number = 0): MockVector {
    return new MockVector().set(x, y, z);
  }

  /**
   * Create mock vector as mock from coordinates.
   */
  public static mock(x: number = 0, y: number = 0, z: number = 0): XR_vector {
    return new MockVector().set(x, y, z) as unknown as XR_vector;
  }

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

  public sub(target: XR_vector): XR_vector {
    return MockVector.mock(this.x - target.x, this.y - target.y, this.z - target.z);
  }

  public distance_to(): number {
    return MockVector.DEFAULT_DISTANCE;
  }
}
