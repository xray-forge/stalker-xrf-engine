import { CHelicopter } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { ClientObject, Optional, TRate, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const heliLooker: LuaTable<number, HeliLook> = new LuaTable();

export class HeliLook {
  public readonly object: ClientObject;
  public lookPoint: Vector;
  public lookState: boolean;

  public constructor(object: ClientObject) {
    this.object = object;
    this.lookPoint = createEmptyVector();
    this.lookState = false;
  }

  public calcLookPoint(destPoint: Optional<Vector>, lookState: boolean): void {
    this.lookState = lookState;

    if (lookState && destPoint) {
      const heli: CHelicopter = this.object.get_helicopter();
      const distToDestPoint: number = heli.GetDistanceToDestPosition();
      const currHeliPosition: Vector = this.object.position();
      const currHeliDirection: Vector = this.object.direction();
      const heliVelocity: number = heli.GetSpeedInDestPoint(0);
      const currHeliVelocity: TRate = heli.GetCurrVelocity();
      const newDirection: Vector = createEmptyVector();

      newDirection.x = (destPoint.x - currHeliPosition.x) / distToDestPoint;
      newDirection.y = (destPoint.y - currHeliPosition.y) / distToDestPoint;
      newDirection.z = (destPoint.z - currHeliPosition.z) / distToDestPoint;

      let delta;

      if (heliVelocity <= 0) {
        delta = 0;
      } else {
        delta = currHeliVelocity / heliVelocity;
        if (delta > 2) {
          delta = 2;
        }
      }

      this.lookPoint.x = heliVelocity ^ (2 * (currHeliDirection.x + (newDirection.x / 2) * (2 - delta)));
      this.lookPoint.y = heliVelocity ^ (2 * (currHeliDirection.y + (newDirection.y / 2) * (2 - delta)));
      this.lookPoint.z = heliVelocity ^ (2 * (currHeliDirection.z + (newDirection.z / 2) * (2 - delta)));

      heli.LookAtPoint(this.lookPoint, lookState);
    }
  }
}

export function getHeliLooker(object: ClientObject): HeliLook {
  if (heliLooker.get(object.id()) === null) {
    heliLooker.set(object.id(), new HeliLook(object));
  }

  return heliLooker.get(object.id());
}
