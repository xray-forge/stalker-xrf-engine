import { CHelicopter } from "xray16";

import { registry } from "@/engine/core/database";
import { GameObject, Optional, TRate } from "@/engine/lib/types";

/**
 * @param helicopter - helicopter object to check
 * @param isInvulnerable - whether object is invulnerable
 * @returns helicopter health
 */
export function getHelicopterHealth(helicopter: CHelicopter, isInvulnerable: Optional<boolean> = null): TRate {
  if (isInvulnerable) {
    helicopter.SetfHealth(1);

    return 1.0;
  }

  const health: TRate = helicopter.GetfHealth();

  if (health < 0) {
    helicopter.SetfHealth(0);

    return 0;
  }

  return health;
}

/**
 * @param object - game object to check
 * @returns whether helicopter is still alive
 */
export function isHelicopterAlive(object: GameObject): boolean {
  return getHelicopterHealth(object.get_helicopter(), registry.objects.get(object.id()).invulnerable) > 0.005;
}
