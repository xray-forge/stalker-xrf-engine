import { XR_cse_alife_object, object_binder, XR_game_object, XR_object_binder } from "xray16";

import { addObject, addZone, deleteObject, deleteZone, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/binders/AnomalyFieldBinder");

// todo: Move to db.
export const FIELDS_BY_NAME: LuaTable<string, IAnomalyFieldBinder> = new LuaTable();
const UPDATE_THROTTLE: number = 5_000;

export interface IAnomalyFieldBinder extends XR_object_binder {
  delta: number;

  set_enable(isEnabled: boolean): void;
}

export const AnomalyFieldBinder: IAnomalyFieldBinder = declare_xr_class("AnomalyFieldBinder", object_binder, {
  delta: UPDATE_THROTTLE,
  __init(object: XR_game_object): void {
    log.info("Init:", object.name(), object.id());

    xr_class_super(object);
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    storage.set(this.object.id(), {});
  },

  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    log.info("Net spawn:", object.name());

    addZone(this.object);
    addObject(this.object);

    FIELDS_BY_NAME.set(this.object.name(), this);

    return true;
  },
  net_destroy(): void {
    log.info("Net destroy:", this.object.name());

    deleteZone(this.object);
    deleteObject(this.object);

    storage.delete(this.object.id());
    FIELDS_BY_NAME.delete(this.object.name());

    object_binder.net_destroy(this);

    log.info("Net destroyed:", this.object.name());
  },
  set_enable(enabled: boolean): void {
    if (enabled) {
      this.object.enable_anomaly();
    } else {
      this.object.disable_anomaly();
    }
  },
  update(delta: number): void {
    this.delta += delta;

    if (this.delta >= UPDATE_THROTTLE) {
      object_binder.update(this, this.delta);

      this.delta = 0;
    } else {
      return;
    }
  },
  net_save_relevant(): boolean {
    return true;
  }
} as IAnomalyFieldBinder);
