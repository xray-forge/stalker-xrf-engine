import {
  alife,
  object_binder,
  XR_cse_alife_object,
  XR_cse_alife_smart_zone,
  XR_game_object,
  XR_object_binder
} from "xray16";

import { AnyCallable } from "@/mod/lib/types";
import { addSmartTerrain, addZone, deleteSmartTerrain, deleteZone } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/binders/SmartTerrainBinder");

export interface ISmartTerrainBinder extends XR_object_binder {
  se_smart_terrain: XR_cse_alife_smart_zone;
}

export const SmartTerrainBinder: ISmartTerrainBinder = declare_xr_class("SmartTerrainBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    this.se_smart_terrain = alife().object(object.id) as XR_cse_alife_smart_zone;

    addZone(this.object);
    addSmartTerrain(this.se_smart_terrain);

    return true;
  },
  net_destroy(): void {
    (get_global("xr_sound").stop_sounds_by_id as AnyCallable)(this.object.id());

    deleteZone(this.object);
    deleteSmartTerrain(this.se_smart_terrain);

    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    object_binder.update(this, delta);
    this.se_smart_terrain.update();
  }
} as ISmartTerrainBinder);
