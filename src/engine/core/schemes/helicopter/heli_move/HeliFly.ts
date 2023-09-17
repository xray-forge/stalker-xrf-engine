import { CHelicopter } from "xray16";

import { createEmptyVector } from "@/engine/core/utils/vector";
import { ClientObject, Optional, TRate, Vector } from "@/engine/lib/types";

const heliFlyer: LuaTable<number, HeliFly> = new LuaTable();

export class HeliFly {
  public object: ClientObject;
  public pointByLook: Vector;
  public blockFlook: boolean;
  public distByLook: number;
  public heliLAccFW: number;
  public heliLAccBW: number;
  public maxVelocity: number;
  public destPoint: Optional<Vector>;
  public pointArr: LuaTable<number, Vector>;

  public constructor(object: ClientObject) {
    this.object = object;
    this.blockFlook = false;
    this.distByLook = 0;
    this.heliLAccFW = 6;
    this.heliLAccBW = 4;
    this.maxVelocity = 0;
    this.pointArr = new LuaTable();
    this.destPoint = null;
    this.pointByLook = createEmptyVector();
  }

  public flyOnPointWithVector(
    destPoint: Vector,
    destDirection: Vector,
    destVelocity: number,
    flagToWpCallback: boolean,
    flagByNullVelocity: boolean
  ): boolean {
    const heli: CHelicopter = this.object.get_helicopter();
    const currHeliPosition: Vector = this.object.position();
    const currHeliDirection: Vector = this.object.direction();
    const currHeliVelocity: number = heli.GetCurrVelocity();

    destVelocity = (destVelocity * 1000) / 3600;
    if (!flagToWpCallback) {
      let timeByFly: number = 0;
      let rezPoint: Vector = createEmptyVector();
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

        rezPoint = this.calcPoint();
        if (!this.blockFlook) {
          rezPoint.x = rezPoint.x + (currHeliDirection.x * delta) / 2;
          rezPoint.z = rezPoint.z + (currHeliDirection.z * delta) / 2;
        }

        flagToWpCallback = true;
      } else {
        rezPoint = destPoint;
        flagToWpCallback = false;
      }

      this.destPoint = rezPoint;
      // ------------------------------------------------
    } else {
      this.destPoint = destPoint;
      flagToWpCallback = false;
    }

    heli.SetDestPosition(this.destPoint);
    this.correctVelocity();
    if (flagByNullVelocity) {
      heli.SetSpeedInDestPoint(0);
    } else {
      heli.SetSpeedInDestPoint(heli.GetMaxVelocity());
    }

    return flagToWpCallback;
  }

  public getBlockFlook(): boolean {
    return this.blockFlook;
  }

  public calcPoint(): Vector {
    const rezPoint: Vector = createEmptyVector();
    const xxArr: LuaTable<number, number> = new LuaTable();

    xxArr.set(0, this.pointArr.get(0).x);
    xxArr.set(1, this.pointArr.get(1).x);
    xxArr.set(2, this.pointArr.get(2).x);

    const yyArr: LuaTable<number, number> = new LuaTable();

    yyArr.set(0, this.pointArr.get(0).y);
    yyArr.set(1, this.pointArr.get(1).y);
    yyArr.set(2, this.pointArr.get(2).y);

    const zzArr: LuaTable<number, number> = new LuaTable();

    zzArr.set(0, this.pointArr.get(0).z);
    zzArr.set(1, this.pointArr.get(1).z);
    zzArr.set(2, this.pointArr.get(2).z);

    rezPoint.y = (this.pointArr.get(0).y + this.pointArr.get(1).y) / 2;

    if (rezPoint.y === this.pointArr.get(0).y) {
      rezPoint.z = (this.pointArr.get(0).z + this.pointArr.get(1).z) / 2;
      if (rezPoint.z === this.pointArr.get(0).z) {
        rezPoint.x = (this.pointArr.get(0).x + this.pointArr.get(1).x) / 2;
        rezPoint.z = this.lagrange(rezPoint.x, xxArr, zzArr);
      } else {
        rezPoint.x = this.lagrange(rezPoint.z, zzArr, xxArr);
      }
    } else {
      rezPoint.x = this.lagrange(rezPoint.y, yyArr, xxArr);
      rezPoint.z = this.lagrange(rezPoint.y, yyArr, zzArr);
    }

    // --'    printf("fly_point[x=%d; y=%d; z=%d;]",rez_point.x, rez_point.y, rez_point.z);

    return rezPoint;
  }

  public lagrange(x: number, xArr: LuaTable<number, number>, yArr: LuaTable<number, number>): number {
    let i;
    let j;
    let m;
    let s = 0;

    for (const i of $range(0, 2)) {
      m = yArr.get(i);
      for (const j of $range(0, 2)) {
        if (j !== i) {
          m = (m * (x - xArr.get(j))) / (xArr.get(i) - xArr.get(j));
        }
      }

      s = s + m;
    }

    return s;
  }

  public correctVelocity(): void {
    const heli = this.object.get_helicopter();
    const currHeliVelocity = heli.GetCurrVelocity();
    const distToDestPoint = heli.GetDistanceToDestPosition();
    const aSpeed = this.heliLAccFW;
    let destVelocity = Math.pow((2 * aSpeed * distToDestPoint + currHeliVelocity) ** 2 / 3, 1 / 2);

    if ((this.maxVelocity * 1000) / 3600 < destVelocity) {
      destVelocity = (this.maxVelocity * 1000) / 3600;
    }

    heli.SetMaxVelocity(destVelocity);
    // --'  printf("dist_to_dest_point %s", dist_to_dest_point);
    // --'    printf("dest_velocity } = %d", dest_velocity);
  }

  public lookAtPosition(): void {
    if (this.blockFlook) {
      const heli: CHelicopter = this.object.get_helicopter();

      heli.LookAtPoint(this.pointByLook, true);
    }
  }

  public setBlockFlook(flBlock: boolean): void {
    this.blockFlook = flBlock;
  }

  public setLookPoint(lPoint: Vector): void {
    this.pointByLook = lPoint;
  }
}
/**
 * todo;
 */
export function getHeliFlyer(object: ClientObject): HeliFly {
  if (heliFlyer.get(object.id()) === null) {
    heliFlyer.set(object.id(), new HeliFly(object));
  }

  return heliFlyer.get(object.id());
}
