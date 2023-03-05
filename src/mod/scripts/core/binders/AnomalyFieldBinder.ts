import { LuabindClass, object_binder, XR_cse_alife_object, XR_game_object } from "xray16";

import { TDuration, TSection } from "@/mod/lib/types";
import { addZone, deleteZone, registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("AnomalyFieldBinder");

// todo: Move to db.
export const FIELDS_BY_NAME: LuaTable<string, AnomalyFieldBinder> = new LuaTable();
const UPDATE_THROTTLE: number = 5_000;

/**
 * todo;
 */
@LuabindClass()
export class AnomalyFieldBinder extends object_binder {
  public delta: TDuration = UPDATE_THROTTLE;

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
  }

  /**
   * todo;
   */
  public override reload(section: TSection): void {
    super.reload(section);
  }

  /**
   * todo;
   */
  public override reinit(): void {
    super.reinit();

    registry.objects.set(this.object.id(), {});
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Net spawn:", object.name());

    addZone(this.object);

    FIELDS_BY_NAME.set(this.object.name(), this);

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    deleteZone(this.object);

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
  public override update(delta: TDuration): void {
    this.delta += delta;

    if (this.delta >= UPDATE_THROTTLE) {
      super.update(this.delta);

      this.delta = 0;
    } else {
      return;
    }
  }

  /**
   * todo;
   */
  public override net_save_relevant(): boolean {
    return true;
  }
}
