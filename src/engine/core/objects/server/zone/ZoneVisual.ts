import { cse_zone_visual, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Visual zone server representation.
 */
@LuabindClass()
export class ZoneVisual extends cse_zone_visual {
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }

  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }
}
