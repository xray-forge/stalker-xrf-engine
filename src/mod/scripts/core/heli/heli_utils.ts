import { XR_CHelicopter, XR_game_object } from "xray16";

import { IStoredObject, storage } from "@/mod/scripts/core/db";

export function get_heli_health(heli: XR_CHelicopter, st: IStoredObject): number {
  let health: number;

  if (st.invulnerable) {
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

export function is_heli_alive(obj: XR_game_object): boolean {
  return get_heli_health(obj.get_helicopter(), storage.get(obj.id())) > 0.005;
}
