import { cse_alife_item_grenade, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ItemGrenade extends cse_alife_item_grenade {
  public isSecretTime: Optional<boolean> = false;

  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
    this.isSecretTime = TreasureManager.getInstance().registerAlifeItem(this);
  }

  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override can_switch_online(): boolean {
    if (this.isSecretTime) {
      return false;
    }

    return super.can_switch_online();
  }
}
