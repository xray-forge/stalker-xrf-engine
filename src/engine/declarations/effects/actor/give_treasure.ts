import { GameObject } from "xray16/alias";
import { extern, LuaArray, TStringId } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Give actor list of treasures.
 * Expects variadic list of treasure IDs.
 */
extern("xr_effects.give_treasure", (_: GameObject, __: GameObject, treasures: LuaArray<TStringId>): void => {
  logger.info("Give treasures for actor");

  const treasureManager: TreasureManager = getManager(TreasureManager);

  for (const [, id] of pairs(treasures)) {
    treasureManager.giveActorTreasureCoordinates(id);
  }
});
