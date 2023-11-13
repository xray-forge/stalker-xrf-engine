import { Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export class MockVector {
  public static create(x: number = 0, y: number = 0, z: number = 0): MockVector {
    return new MockVector().set(x, y, z);
  }

  public static mock(x: number = 0, y: number = 0, z: number = 0): Vector {
    return new MockVector().set(x, y, z) as unknown as Vector;
  }

  public static DEFAULT_DISTANCE: number = 20;

  public x: number = 0;
  public y: number = 0;
  public z: number = 0;

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

  public add(first: MockVector | number, second?: MockVector): MockVector {
    if (typeof first === "number") {
      this.x += first;
      this.y += first;
      this.z += first;
    } else if (second === undefined) {
      this.x += first.x;
      this.y += first.y;
      this.z += first.z;
    } else {
      this.x = first.x + second.x;
      this.y = first.y + second.y;
      this.z = first.z + second.z;
    }

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

  public mul(by: number | MockVector): MockVector {
    if (typeof by === "number") {
      this.x *= by;
      this.y *= by;
      this.z *= by;

      return this;
    } else {
      throw new Error("Not mocked overload used.");
    }
  }

  public distance_to(): number {
    return MockVector.DEFAULT_DISTANCE;
  }

  public distance_to_sqr(): number {
    return this.distance_to() * this.distance_to();
  }

  public dotproduct(target: MockVector): number {
    return this.x * target.x + this.y * target.y + this.z * target.z;
  }

  public normalize(): MockVector {
    if (this.x === 0 && this.y === 0 && this.z === 0) {
      return this;
    }

    const magnitude: number = Math.sqrt(1 / (this.x * this.x + this.y * this.y + this.z * this.z));

    this.x *= magnitude;
    this.y *= magnitude;
    this.z *= magnitude;

    return this;
  }

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

  public setHP(h: number, p: number): MockVector {
    const ch = Math.cos(h);
    const cp = Math.cos(p);
    const sh = Math.sin(h);
    const sp = Math.sin(p);

    this.x = -cp * sh;
    this.y = sp;
    this.z = cp * ch;

    return this;
  }
}
