import { cse_alife_item, LuabindClass } from "xray16";

import { Optional } from "@/engine/lib/types";
import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/scripts/core/database";
import { TreasureManager } from "@/engine/scripts/core/managers/TreasureManager";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Item extends cse_alife_item {
  public secret_item: Optional<boolean> = false;

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
    this.secret_item = TreasureManager.getInstance().registerAlifeItem(this);
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  /**
   * todo;
   */
  public override can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return super.can_switch_online();
  }
}
