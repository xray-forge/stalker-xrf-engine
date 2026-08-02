import { extern, isObjectInZone } from "xray16/lib";
import { $filename } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Give the Zaton b100 helicopter #2 searching info portion when the actor is in the related zone.
 */
extern("xr_effects.zat_b100_heli_2_searching", (): void => {
  logger.info("Searching helicopter #2");

  if (isObjectInZone(registry.actor, registry.zones.get("zat_b100_heli_2"))) {
    giveInfoPortion(infoPortions.zat_b100_heli_2_searching);
  }
});
