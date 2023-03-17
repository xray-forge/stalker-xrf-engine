import { LuabindClass, object_binder, XR_cse_alife_object, XR_game_object } from "xray16";

import { registerZone, registry, resetObject, unregisterZone } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

// todo: Move to db.
export const FIELDS_BY_NAME: LuaTable<string, AnomalyFieldBinder> = new LuaTable();

/**
 * todo;
 */
@LuabindClass()
export class AnomalyFieldBinder extends object_binder {
  /**
   * todo;
   */
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Net spawn:", object.name());

    registerZone(this.object);

    FIELDS_BY_NAME.set(this.object.name(), this);

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    unregisterZone(this.object);

    registry.objects.delete(this.object.id());
    FIELDS_BY_NAME.delete(this.object.name());

    super.net_destroy();
  }

  /**
   * todo;
   */
  public set_enable(enabled: boolean): void {
    if (enabled) {
      this.object.enable_anomaly();
    } else {
      this.object.disable_anomaly();
    }
  }

  /**
   * todo;
   */
  public override net_save_relevant(): boolean {
    return true;
  }
}
