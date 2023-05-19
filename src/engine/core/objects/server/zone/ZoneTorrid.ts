import { cse_torrid_zone, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Torrid zone server representation.
 */
@LuabindClass()
export class ZoneTorrid extends cse_torrid_zone {
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }

  public override on_unregister() {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }
}
