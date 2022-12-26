import { addObject, addZone, deleteObject, deleteZone, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/binders/AnomalyFieldBinder");

export const FIELDS_BY_NAME: Record<string, any> = {};

export interface IAnomalyFieldBinder extends XR_object_binder {
  last_update: number;
  // todo: Probably not needed.
  st: any;

  set_enable(isEnabled: boolean): void;
}

export const AnomalyFieldBinder: IAnomalyFieldBinder = declare_xr_class("AnomalyFieldBinder", object_binder, {
  __init(object: XR_game_object): void {
    log.info("Init binder:", object.name());

    xr_class_super(object);
    this.last_update = time_global();
  },
  __finalize() {
    log.info("Finalized");
  },
  reload(section: string): void {
    log.info("Reload binder:", this.object.name());
    object_binder.reload(this, section);
  },
  reinit(): void {
    log.info("Reinit binder:", this.object.name());

    object_binder.reinit(this);

    storage[this.object.id()] = {} as XR_object_binder;
    this.st = storage[this.object.id()];
  },

  net_spawn(object: XR_game_object): boolean {
    log.info("Net spawn:", object.name());

    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    addZone(this.object);
    addObject(this.object);

    FIELDS_BY_NAME[this.object.name()] = this;

    return true;
  },
  net_destroy(): void {
    log.info("Net destroy:", this.object.name());

    deleteZone(this.object);
    deleteObject(this.object);

    storage[this.object.id()] = null as any;
    FIELDS_BY_NAME[this.object.name()] = null;

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
    object_binder.update(this, value);

    if (time_global() - this.last_update < 10000) {
      return;
    }

    this.last_update = time_global();
  },
  net_save_relevant(): boolean {
    return true;
  }
} as IAnomalyFieldBinder);
