import { cse_alife_space_restrictor, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/world/treasures";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Restriction control zone representation.
 */
@LuabindClass()
export class ZoneRestrictor extends cse_alife_space_restrictor {
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
    TreasureManager.registerRestrictor(this);
  }

  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
