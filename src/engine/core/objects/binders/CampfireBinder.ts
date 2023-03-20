import { LuabindClass, object_binder, XR_cse_alife_object, XR_CZoneCampfire, XR_game_object } from "xray16";

import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isEmpty } from "@/engine/core/utils/table";
import { Optional, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const campfire_table_by_smart_names: LuaTable<TName, LuaTable<TNumberId, XR_CZoneCampfire>> = new LuaTable();

/**
 * todo;
 */
@LuabindClass()
export class CampfireBinder extends object_binder {
  public readonly campfire: XR_CZoneCampfire;

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
    this.campfire = object.get_campfire();
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Register", object.name());

    const [smartTerrainName] = string.gsub(this.object.name(), "_campfire_%d*", "");

    if (SimulationBoardManager.getInstance().getSmartTerrainByName(smartTerrainName) !== null) {
      this.campfire.turn_off();

      if (campfire_table_by_smart_names.get(smartTerrainName) === null) {
        campfire_table_by_smart_names.set(smartTerrainName, new LuaTable());
      }

      campfire_table_by_smart_names.get(smartTerrainName).set(this.object.id(), this.campfire);
    }

    return true;
  }
}

/**
 * todo;
 */
export function turnOnCampfiresBySmartName(smartTerrainName: TName): void {
  logger.info("Turn on campfires for:", smartTerrainName);

  const smartTerrainCampfires: Optional<LuaTable<TNumberId, XR_CZoneCampfire>> =
    campfire_table_by_smart_names.get(smartTerrainName);

  if (smartTerrainCampfires !== null && !isEmpty(smartTerrainCampfires)) {
    for (const [k, v] of smartTerrainCampfires) {
      if (!v.is_on()) {
        v.turn_on();
      }
    }
  }
}

/**
 * todo;
 */
export function turnOffCampfiresBySmartTerrainName(smartTerrainName: TName): void {
  logger.info("Turn off campfires for:", smartTerrainName);

  const smartTerrainCampfires: Optional<LuaTable<TNumberId, XR_CZoneCampfire>> =
    campfire_table_by_smart_names.get(smartTerrainName);

  if (smartTerrainCampfires !== null && !isEmpty(smartTerrainCampfires)) {
    for (const [id, campfire] of smartTerrainCampfires) {
      if (campfire.is_on()) {
        campfire.turn_off();
      }
    }
  }
}
