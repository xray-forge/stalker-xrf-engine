import { addObject, addZone, deleteObject, deleteZone, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/binders/AnomalyFieldBinder");

// todo: Move to db.
export const FIELDS_BY_NAME: LuaTable<string, IAnomalyFieldBinder> = new LuaTable();
const UPDATE_THROTTLE: number = 10000;

export interface IAnomalyFieldBinder extends XR_object_binder {
  updatedAt: number;

  set_enable(isEnabled: boolean): void;
}

export const AnomalyFieldBinder: IAnomalyFieldBinder = declare_xr_class("AnomalyFieldBinder", object_binder, {
  __init(object: XR_game_object): void {
    log.info("Init binder:", object.name(), object.id());

    xr_class_super(object);

    this.updatedAt = time_global();
  },
  reload(section: string): void {
    log.info("Reload binder:", this.object.name(), this.object.id());
    object_binder.reload(this, section);
  },
  reinit(): void {
    log.info("Reinit binder:", this.object.name(), this.object.id());

    object_binder.reinit(this);

    storage.set(this.object.id(), {});
  },

  net_spawn(object: XR_game_object): boolean {
    log.info("Net spawn:", object.name());

    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

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
    log.info("Toggle anomaly:", this.object.name(), enabled);

    if (enabled) {
      this.object.enable_anomaly();
    } else {
      this.object.disable_anomaly();
    }
  },
  update(value: number): void {
    const now: number = time_global();

    if (now - this.updatedAt > UPDATE_THROTTLE) {
      this.updatedAt = now;

      object_binder.update(this, value);
    }
  },
  net_save_relevant(): boolean {
    return true;
  }
} as IAnomalyFieldBinder);
