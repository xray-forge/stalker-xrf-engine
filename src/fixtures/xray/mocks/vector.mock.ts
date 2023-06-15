import { Vector } from "@/engine/lib/types";

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
  public static mock(x: number = 0, y: number = 0, z: number = 0): Vector {
    return new MockVector().set(x, y, z) as unknown as Vector;
  }

  public static DEFAULT_DISTANCE: number = 20;

  public x: number = 0;
  public y: number = 0;
  public z: number = 0;

  /**
   * todo: Description.
   */
  public set(x: number, y: number, z: number): MockVector;
  public set(x: number | MockVector, y: number, z: number): MockVector {
    if (x instanceof MockVector) {
      return new MockVector().set(x.x, x.y, x.z);
    }

    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  /**
   * todo: Description.
   */
  public add(first: MockVector, second: MockVector): MockVector {
    this.x = first.x + second.x;
    this.y = first.y + second.y;
    this.z = first.z + second.z;

    return this;
  }

  public sub(first: MockVector, second?: MockVector): MockVector {
    if (second) {
      this.x = first.x - second.x;
      this.y = first.y - second.y;
      this.z = first.z - second.z;
    } else {
      this.x -= first.x;
      this.y -= first.y;
      this.z -= first.z;
    }

    return this;
  }

  public distance_to(): number {
    return MockVector.DEFAULT_DISTANCE;
  }

  public normalize(): void {}

  public getH(): number {
    if (this.x === 0 && this.z === 0) {
      return 0.0;
    } else {
      if (this.z === 0) {
        return this.x > 0 ? -(Math.PI / 2) : Math.PI / 2;
      } else if (this.z < 0) {
        return -(Math.atan(this.x / this.z) - Math.PI);
      } else {
        return -Math.atan(this.x / this.z);
      }
    }
  }
}
