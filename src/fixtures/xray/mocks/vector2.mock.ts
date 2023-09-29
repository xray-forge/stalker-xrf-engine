import { Vector2D } from "@/engine/lib/types";

/**
 * todo;
 */
export class MockVector2D {
  /**
   * Create mock vector from coordinates.
   */
  public static create(x: number = 0, y: number = 0): MockVector2D {
    return new MockVector2D().set(x, y);
  }

  /**
   * Create mock vector as mock from coordinates.
   */
  public static mock(x: number = 0, y: number = 0): Vector2D {
    return new MockVector2D().set(x, y) as unknown as Vector2D;
  }

  public static DEFAULT_DISTANCE: number = 20;

  public x: number = 0;
  public y: number = 0;

  /**
   * todo: Description.
   */
  public set(x: number, y: number): MockVector2D;
  public set(x: number | MockVector2D, y: number): MockVector2D {
    if (x instanceof MockVector2D) {
      return new MockVector2D().set(x.x, x.y);
    }

    this.x = x;
    this.y = y;

    return this;
  }

  /**
   * Mock vector add method implementation.
   */
  public add(first: MockVector2D | number, second?: MockVector2D): MockVector2D {
    if (typeof first === "number") {
      this.x += first;
      this.y += first;
    } else if (second === undefined) {
      this.x += first.x;
      this.y += first.y;
    } else {
      this.x = first.x + second.x;
      this.y = first.y + second.y;
    }

    return this;
  }

  public sub(first: MockVector2D, second?: MockVector2D): MockVector2D {
    if (second) {
      this.x = first.x - second.x;
      this.y = first.y - second.y;
    } else {
      this.x -= first.x;
      this.y -= first.y;
    }

    return this;
  }

  public mul(by: number | MockVector2D): MockVector2D {
    if (typeof by === "number") {
      this.x *= by;
      this.y *= by;

      return this;
    } else {
      throw new Error("Not mocked overload used.");
    }
  }

  public distance_to(): number {
    return MockVector2D.DEFAULT_DISTANCE;
  }

  public distance_to_sqr(): number {
    return this.distance_to() * this.distance_to();
  }

  public dotproduct(target: MockVector2D): number {
    return this.x * target.x + this.y * target.y;
  }

  public normalize(): MockVector2D {
    if (this.x === 0 && this.y === 0) {
      return this;
    }

    const magnitude: number = Math.sqrt(1 / (this.x * this.x + this.y * this.y));

    this.x *= magnitude;
    this.y *= magnitude;

    return this;
  }
}
