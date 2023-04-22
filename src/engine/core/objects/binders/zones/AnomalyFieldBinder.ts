import { LuabindClass, object_binder, XR_cse_alife_object } from "xray16";

import { registerAnomalyField, resetObject, unregisterAnomalyField } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class AnomalyFieldBinder extends object_binder {
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerAnomalyField(this);

    return true;
  }

  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    unregisterAnomalyField(this);

    super.net_destroy();
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo: Description.
   */
  public setEnabled(isEnabled: boolean): void {
    return isEnabled ? this.object.enable_anomaly() : this.object.disable_anomaly();
  }
}
