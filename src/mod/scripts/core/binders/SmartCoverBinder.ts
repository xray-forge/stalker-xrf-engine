import { object_binder, XR_cse_alife_object, XR_game_object, XR_object_binder } from "xray16";

import { vectorToString } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/binders/SmartCoverBinder");

// todo: Move to db.
export const registered_smartcovers: LuaTable<string, XR_game_object> = new LuaTable();

export interface ISmartCoverBinder extends XR_object_binder {}

export const SmartCoverBinder: ISmartCoverBinder = declare_xr_class("SmartCoverBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);

    log.info("Init:", object.name());
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    registered_smartcovers.set(this.object.name(), this.object);
    log.info("Smart cover register:", this.object.name(), vectorToString(this.object.direction()));

    return true;
  },
  net_destroy(): void {
    registered_smartcovers.delete(this.object.name());
    log.info("Smart cover unregister:", this.object.name());
    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    object_binder.update(this, delta);
  }
} as ISmartCoverBinder);
