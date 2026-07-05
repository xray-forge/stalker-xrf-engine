import { CHelicopter } from "xray16";
import { GameObject } from "xray16/alias";
import { Nillable, TRate } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * @param helicopter - Helicopter object to check.
 * @param isInvulnerable - Whether object is invulnerable.
 * @returns Helicopter health.
 */
export function getHelicopterHealth(helicopter: CHelicopter, isInvulnerable: Nillable<boolean> = null): TRate {
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
 * @param object - Game object to check.
 * @returns Whether helicopter is still alive.
 */
export function isHelicopterAlive(object: GameObject): boolean {
  return getHelicopterHealth(object.get_helicopter(), registry.objects.get(object.id()).invulnerable) > 0.005;
}
