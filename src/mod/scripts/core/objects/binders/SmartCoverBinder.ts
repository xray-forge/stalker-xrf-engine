import { LuabindClass, object_binder, XR_cse_alife_object, XR_game_object } from "xray16";

import { TDuration } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SmartCoverBinder");

/**
 * todo;
 */
@LuabindClass()
export class SmartCoverBinder extends object_binder {
  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    return super.net_spawn(object);
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    return super.net_destroy();
  }

  /**
   * todo;
   */
  public override update(delta: TDuration): void {
    super.update(delta);
  }
}
