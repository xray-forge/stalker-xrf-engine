import { CHelicopter } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ClientObject, TRate } from "@/engine/lib/types";

export function get_heli_health(heli: CHelicopter, state: IRegistryObjectState): number {
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

export function is_heli_alive(object: ClientObject): boolean {
  return get_heli_health(object.get_helicopter(), registry.objects.get(object.id())) > 0.005;
}
