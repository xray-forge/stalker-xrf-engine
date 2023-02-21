import { alife, object_binder, XR_cse_alife_object, XR_game_object, XR_object_binder } from "xray16";

import { ISmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { addSmartTerrain, deleteSmartTerrain } from "@/mod/scripts/core/database";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SmartTerrainBinder");

export interface ISmartTerrainBinder extends XR_object_binder {
  se_smart_terrain: ISmartTerrain;
}

export const SmartTerrainBinder: ISmartTerrainBinder = declare_xr_class("SmartTerrainBinder", object_binder, {
  __init(object: XR_game_object): void {
    object_binder.__init(this, object);
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    this.se_smart_terrain = alife().object(object.id) as ISmartTerrain;

    addSmartTerrain(this.object, this.se_smart_terrain);

    return true;
  },
  net_destroy(): void {
    GlobalSound.stop_sounds_by_id(this.object.id());

    deleteSmartTerrain(this.object, this.se_smart_terrain);

    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    object_binder.update(this, delta);
    this.se_smart_terrain.update();
  },
} as ISmartTerrainBinder);
