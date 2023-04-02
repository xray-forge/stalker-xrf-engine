import { LuabindClass, object_binder, XR_cse_alife_object, XR_CZoneCampfire, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class CampfireBinder extends object_binder {
  public readonly campfire: XR_CZoneCampfire;

  public constructor(object: XR_game_object) {
    super(object);
    this.campfire = object.get_campfire();
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Register", object.name());

    const [smartTerrainName] = string.gsub(this.object.name(), "_campfire_%d*", "");

    if (SimulationBoardManager.getInstance().getSmartTerrainByName(smartTerrainName) !== null) {
      this.campfire.turn_off();

      if (registry.smartTerrainsCampfires.get(smartTerrainName) === null) {
        registry.smartTerrainsCampfires.set(smartTerrainName, new LuaTable());
      }

      registry.smartTerrainsCampfires.get(smartTerrainName).set(this.object.id(), this.campfire);
    }

    return true;
  }
}
