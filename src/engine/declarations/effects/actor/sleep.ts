import { extern, isObjectInZone } from "xray16/lib";

import { getManager, registry } from "@/engine/core/database";
import { sleepConfig } from "@/engine/core/managers/sleep";
import { SleepManager } from "@/engine/core/managers/sleep/SleepManager";

import { logger } from "./shared";

/**
 * Trigger sleep dialog for actor.
 * Checks if actor is in one of sleep zones and shows UI.
 *
 * Todo: Is zone check needed?
 */
extern("xr_effects.sleep", (): void => {
  logger.info("Sleep effect");

  for (const [, zone] of sleepConfig.SLEEP_ZONES) {
    if (isObjectInZone(registry.actor, registry.zones.get(zone))) {
      logger.info("Actor sleep in: '%s'", zone);

      getManager(SleepManager).showSleepDialog();

      return;
    }
  }
});
