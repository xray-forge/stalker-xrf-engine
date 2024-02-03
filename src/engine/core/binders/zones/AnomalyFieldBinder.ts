import { LuabindClass, object_binder } from "xray16";

import { registerAnomalyField, resetObject, unregisterAnomalyField } from "@/engine/core/database";
import { ServerObject } from "@/engine/lib/types";

/**
 * Binder of anomaly field game object.
 * Represents smaller single anomaly objects.
 */
@LuabindClass()
export class AnomalyFieldBinder extends object_binder {
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerAnomalyField(this);

    return true;
  }

  public override net_destroy(): void {
    unregisterAnomalyField(this);

    super.net_destroy();
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * Toggle anomaly field availability.
   *
   * @param isEnabled - anomaly field next state
   */
  public setEnabled(isEnabled: boolean): void {
    if (isEnabled) {
      this.object.enable_anomaly();
    } else {
      this.object.disable_anomaly();
    }
  }
}
