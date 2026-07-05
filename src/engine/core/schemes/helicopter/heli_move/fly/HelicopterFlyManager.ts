import { CHelicopter } from "xray16";
import { GameObject, Vector } from "xray16/alias";
import { LuaArray, Nillable, TDistance, TRate } from "xray16/lib";

import { createEmptyVector } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * Manager handling helicopter flight movement towards destination points.
 */
export class HelicopterFlyManager {
  public readonly object: GameObject;

  public pointByLook: Readonly<Vector> = ZERO_VECTOR;
  public blockFlook: boolean = false;
  public heliLAccFW: number = 6;
  public heliLAccBW: number = 4;
  public maxVelocity: number = 0;
  public destPoint: Nillable<Vector> = null;
  public pointArr: LuaTable<number, Vector> = new LuaTable();

  public constructor(object: GameObject) {
    this.object = object;
  }

  /**
   * Fly the helicopter towards a destination point along a desired direction and velocity.
   *
   * @param destPoint - Target position the helicopter should fly to.
   * @param destDirection - Desired facing direction at the destination.
   * @param destVelocity - Desired velocity at the destination, in km/h.
   * @param flagToWpCallback - Whether the helicopter is already approaching the waypoint callback phase.
   * @param flagByNullVelocity - Whether the helicopter should arrive at the destination with zero velocity.
   * @returns Whether the waypoint callback phase has been reached.
   */
  public flyOnPointWithVector(
    destPoint: Vector,
    destDirection: Vector,
    destVelocity: TRate,
    flagToWpCallback: boolean,
    flagByNullVelocity: boolean
  ): boolean {
    const helicopter: CHelicopter = this.object.get_helicopter();
    const currHeliPosition: Vector = this.object.position();
    const currHeliDirection: Vector = this.object.direction();
    const currHeliVelocity: TRate = helicopter.GetCurrVelocity();

    destVelocity = (destVelocity * 1000) / 3600;

    if (!flagToWpCallback) {
      let timeByFly: number = 0;
      let rezPoint: Vector = ZERO_VECTOR;
      let aSpeed: TRate = 0;
      let dPath: number;

      if (destVelocity >= currHeliVelocity) {
        aSpeed = this.heliLAccFW;
        dPath = (currHeliVelocity * 2) / aSpeed;
      } else {
        aSpeed = -this.heliLAccBW;
        dPath = (-currHeliVelocity * 2) / aSpeed;
      }

      timeByFly = (destVelocity - currHeliVelocity) / aSpeed; // -- t=(v2-v1)/a

      const delta = currHeliVelocity * timeByFly + (aSpeed * timeByFly * timeByFly) / 2;

      if (delta >= dPath) {
        this.pointArr.set(0, currHeliPosition);
        this.pointArr.set(1, destPoint);
        this.pointArr.set(2, currHeliDirection);

        rezPoint = this.calculatePoint();
        if (!this.blockFlook) {
          rezPoint.x += (currHeliDirection.x * delta) / 2;
          rezPoint.z += (currHeliDirection.z * delta) / 2;
        }

        flagToWpCallback = true;
      } else {
        rezPoint = destPoint;
        flagToWpCallback = false;
      }

      this.destPoint = rezPoint;
    } else {
      this.destPoint = destPoint;
      flagToWpCallback = false;
    }

    helicopter.SetDestPosition(this.destPoint);
    this.correctVelocity();

    helicopter.SetSpeedInDestPoint(flagByNullVelocity ? 0 : helicopter.GetMaxVelocity());

    return flagToWpCallback;
  }

  /**
   * Interpolate an intermediate point between the stored start and destination points.
   *
   * @returns Calculated intermediate point.
   */
  public calculatePoint(): Vector {
    const result: Vector = createEmptyVector();
    const xxArr: LuaArray<number> = new LuaTable();

    xxArr.set(0, this.pointArr.get(0).x);
    xxArr.set(1, this.pointArr.get(1).x);
    xxArr.set(2, this.pointArr.get(2).x);

    const yyArr: LuaArray<number> = new LuaTable();

    yyArr.set(0, this.pointArr.get(0).y);
    yyArr.set(1, this.pointArr.get(1).y);
    yyArr.set(2, this.pointArr.get(2).y);

    const zzArr: LuaArray<number> = new LuaTable();

    zzArr.set(0, this.pointArr.get(0).z);
    zzArr.set(1, this.pointArr.get(1).z);
    zzArr.set(2, this.pointArr.get(2).z);

    result.y = (this.pointArr.get(0).y + this.pointArr.get(1).y) / 2;

    if (result.y === this.pointArr.get(0).y) {
      result.z = (this.pointArr.get(0).z + this.pointArr.get(1).z) / 2;
      if (result.z === this.pointArr.get(0).z) {
        result.x = (this.pointArr.get(0).x + this.pointArr.get(1).x) / 2;
        result.z = this.lagrange(result.x, xxArr, zzArr);
      } else {
        result.x = this.lagrange(result.z, zzArr, xxArr);
      }
    } else {
      result.x = this.lagrange(result.y, yyArr, xxArr);
      result.z = this.lagrange(result.y, yyArr, zzArr);
    }

    return result;
  }

  /**
   * Compute a Lagrange polynomial interpolation for the provided value and sample points.
   *
   * @param x - Value to interpolate at.
   * @param xList - Sample input values.
   * @param yList - Sample output values corresponding to the inputs.
   * @returns Interpolated value at the given point.
   */
  public lagrange(x: number, xList: LuaArray<number>, yList: LuaArray<number>): TRate {
    let s: TRate = 0;

    for (const i of $range(0, 2)) {
      let m: TRate = yList.get(i);

      for (const j of $range(0, 2)) {
        if (j !== i) {
          m = (m * (x - xList.get(j))) / (xList.get(i) - xList.get(j));
        }
      }

      s += m;
    }

    return s;
  }

  /**
   * Adjust the helicopter maximum velocity based on distance to the destination, clamped to the configured limit.
   */
  public correctVelocity(): void {
    const helicopter: CHelicopter = this.object.get_helicopter();
    const velocity: TRate = helicopter.GetCurrVelocity();
    const distance: TDistance = helicopter.GetDistanceToDestPosition();
    const acceleration: TRate = this.heliLAccFW;

    let destVelocity: TRate = Math.sqrt((2 * acceleration * distance + velocity ** 2) / 3);

    if ((this.maxVelocity * 1000) / 3600 < destVelocity) {
      destVelocity = (this.maxVelocity * 1000) / 3600;
    }

    helicopter.SetMaxVelocity(destVelocity);
  }

  /**
   * Make the helicopter look at the configured look point when look blocking is enabled.
   */
  public lookAtPosition(): void {
    if (this.blockFlook) {
      const heli: CHelicopter = this.object.get_helicopter();

      heli.LookAtPoint(this.pointByLook, true);
    }
  }

  /**
   * Set whether the helicopter look direction is blocked to a fixed look point.
   *
   * @param isFlookBlocked - Whether the look direction should be blocked.
   */
  public setBlockFlook(isFlookBlocked: boolean): void {
    this.blockFlook = isFlookBlocked;
  }

  /**
   * Set the fixed point the helicopter should look at when look blocking is enabled.
   *
   * @param lPoint - Point to look at.
   */
  public setLookPoint(lPoint: Vector): void {
    this.pointByLook = lPoint;
  }
}
