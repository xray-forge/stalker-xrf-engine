import { cse_anomalous_zone, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Anomalous zone server representation.
 */
@LuabindClass()
export class ZoneAnomalous extends cse_anomalous_zone {
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }

  public override on_unregister() {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }
}
