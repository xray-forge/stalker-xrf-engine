import { LuabindClass, object_binder } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, ServerObject, ZoneCampfire } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class CampfireBinder extends object_binder {
  public readonly campfire: ZoneCampfire;

  public constructor(object: ClientObject) {
    super(object);
    this.campfire = object.get_campfire();
  }

  public override net_spawn(object: ServerObject): boolean {
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
