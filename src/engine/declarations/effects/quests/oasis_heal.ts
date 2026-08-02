import { GameObject } from "xray16/alias";
import { extern, TRate } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Apply Oasis healing effect deltas to the actor while the actor is inside the Oasis restrictor.
 */
extern("xr_effects.oasis_heal", (): void => {
  const actor: GameObject = registry.actor;

  // Delta values for assignment:
  const newHealth: TRate = 0.005;
  const newPower: TRate = 0.01;
  const newBleeding: TRate = 0.05;
  const newRadiation: TRate = -0.05;

  if (actor.health < 1) {
    actor.health = newHealth;
  }

  if (actor.power < 1) {
    actor.power = newPower;
  }

  if (actor.radiation > 0) {
    actor.radiation = newRadiation;
  }

  if (actor.bleeding > 0) {
    actor.bleeding = newBleeding;
  }

  actor.satiety = 0.01;
});
