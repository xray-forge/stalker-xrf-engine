import { CHelicopter } from "xray16";

import { createEmptyVector, createVector } from "@/engine/core/utils/vector";
import { GameObject, Optional, TDistance, TNumberId, TRate, Vector } from "@/engine/lib/types";

const heliLooker: LuaTable<TNumberId, HelicopterLookManager> = new LuaTable();

export class HelicopterLookManager {
  public readonly object: GameObject;

  public lookPoint: Vector = createEmptyVector();
  public lookState: boolean = false;

  public constructor(object: GameObject) {
    this.object = object;
  }

  public calculateLookPoint(destination: Optional<Vector>, lookState: boolean): void {
    this.lookState = lookState;

    if (lookState && destination) {
      const helicopter: CHelicopter = this.object.get_helicopter();
      const distance: TDistance = helicopter.GetDistanceToDestPosition();
      const position: Vector = this.object.position();
      const direction: Vector = this.object.direction();
      const velocity: TRate = helicopter.GetSpeedInDestPoint(0);
      const currentVelocity: TRate = helicopter.GetCurrVelocity();
      const newDirection: Vector = createVector(
        (destination.x - position.x) / distance,
        (destination.y - position.y) / distance,
        (destination.z - position.z) / distance
      );

      const delta: TRate = velocity <= 0 ? 0 : math.max(currentVelocity / velocity, 2);

      this.lookPoint.x = Math.pow(velocity, 2) * (direction.x + (newDirection.x / 2) * (2 - delta));
      this.lookPoint.y = Math.pow(velocity, 2) * (direction.y + (newDirection.y / 2) * (2 - delta));
      this.lookPoint.z = Math.pow(velocity, 2) * (direction.z + (newDirection.z / 2) * (2 - delta));

      helicopter.LookAtPoint(this.lookPoint, lookState);
    }
  }
}

/**
 * todo;
 */
export function getHeliLooker(object: GameObject): HelicopterLookManager {
  if (heliLooker.get(object.id()) === null) {
    heliLooker.set(object.id(), new HelicopterLookManager(object));
  }

  return heliLooker.get(object.id());
}
