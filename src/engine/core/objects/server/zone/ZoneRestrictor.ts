import { cse_alife_space_restrictor, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
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
    TreasureManager.getInstance().registerAlifeRestrictor(this);
  }

  public override on_unregister() {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
