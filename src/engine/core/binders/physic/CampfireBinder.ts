import { LuabindClass, object_binder } from "xray16";

import { getManager, registerSmartTerrainCampfire, unRegisterSmartTerrainCampfire } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Optional, ServerObject } from "@/engine/lib/types";

/**
 * Bind campfire game object.
 */
@LuabindClass()
export class CampfireBinder extends object_binder {
  // Smart terrain owning campfire.
  public terrain: Optional<SmartTerrain> = null;

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    // logger.format("Register: %s", object.name());

    const [smartTerrainName] = string.gsub(this.object.name(), "_campfire_%d*", "");

    this.terrain = getManager(SimulationManager).getSmartTerrainByName(smartTerrainName);

    if (this.terrain) {
      registerSmartTerrainCampfire(this.terrain, this.object);
    }

    return true;
  }

  public override net_destroy(): void {
    super.net_destroy();

    if (this.terrain) {
      unRegisterSmartTerrainCampfire(this.terrain, this.object);
      this.terrain = null;
    }
  }
}
