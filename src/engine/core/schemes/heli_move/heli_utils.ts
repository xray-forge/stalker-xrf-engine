import { CHelicopter, game_object } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";

export function get_heli_health(heli: CHelicopter, state: IRegistryObjectState): number {
  let health: number;

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

export function is_heli_alive(obj: game_object): boolean {
  return get_heli_health(obj.get_helicopter(), registry.objects.get(obj.id())) > 0.005;
}
