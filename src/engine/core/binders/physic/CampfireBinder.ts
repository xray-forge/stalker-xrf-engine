import { LuabindClass, object_binder } from "xray16";
import { ServerObject } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { registerSmartTerrainCampfire, unRegisterSmartTerrainCampfire } from "@/engine/core/database";
import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";

/**
 * Bind campfire game object.
 */
@LuabindClass()
export class CampfireBinder extends object_binder {
  // Smart terrain owning campfire.
  public terrain: Nillable<SmartTerrain> = null;

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    // logger.format("Register: %s", object.name());

    const [terrainName] = string.gsub(this.object.name(), "_campfire_%d*", "");

    this.terrain = getSimulationTerrainByName(terrainName);

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
