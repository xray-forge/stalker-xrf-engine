import { CHelicopter } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ClientObject, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export function getHeliHealth(heli: CHelicopter, state: IRegistryObjectState): number {
  let health: TRate;

  if (state.invulnerable) {
    health = 1;
    heli.SetfHealth(health);
  } else {
    health = heli.GetfHealth();

    if (health < 0) {
      heli.SetfHealth(0);
      health = 0;
    }
  }

  return health;
}

/**
 * todo;
 */
export function isHeliAlive(object: ClientObject): boolean {
  return getHeliHealth(object.get_helicopter(), registry.objects.get(object.id())) > 0.005;
}
