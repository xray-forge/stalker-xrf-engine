import { LuabindClass, object_binder } from "xray16";

import { registerSmartTerrainCampfire, unRegisterSmartTerrainCampfire } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, ServerObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Bind campfire client object.
 */
@LuabindClass()
export class CampfireBinder extends object_binder {
  // Smart terrain owning campfire.
  public smartTerrain: Optional<SmartTerrain> = null;

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    // logger.info("Register:", object.name());

    const [smartTerrainName] = string.gsub(this.object.name(), "_campfire_%d*", "");

    this.smartTerrain = SimulationBoardManager.getInstance().getSmartTerrainByName(smartTerrainName);

    if (this.smartTerrain) {
      registerSmartTerrainCampfire(this.smartTerrain, this.object);
    }

    return true;
  }

  public override net_destroy(): void {
    super.net_destroy();

    if (this.smartTerrain) {
      unRegisterSmartTerrainCampfire(this.smartTerrain, this.object);
      this.smartTerrain = null;
    }
  }
}
