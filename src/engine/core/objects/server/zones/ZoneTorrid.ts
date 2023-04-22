import { cse_torrid_zone, LuabindClass } from "xray16";

import { registerObjectStoryLinks } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: On unregister remove story ID from manager?
 */
@LuabindClass()
export class ZoneTorrid extends cse_torrid_zone {
  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }
}
