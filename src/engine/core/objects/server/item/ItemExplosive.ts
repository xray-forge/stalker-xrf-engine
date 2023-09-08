import { cse_alife_item_explosive, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/world/treasures";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Explosive item server representation.
 */
@LuabindClass()
export class ItemExplosive extends cse_alife_item_explosive {
  public isSecretItem: Optional<boolean> = false;

  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
    this.isSecretItem = TreasureManager.registerItem(this);
  }

  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override can_switch_online(): boolean {
    if (this.isSecretItem) {
      return false;
    }

    return super.can_switch_online();
  }
}
