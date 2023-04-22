import { cse_anomalous_zone, LuabindClass } from "xray16";

import { registerObjectStoryLinks } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ZoneAnomalous extends cse_anomalous_zone {
  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }
}
