import { cse_alife_inventory_box, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/TreasureManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class InventoryBox extends cse_alife_inventory_box {
  public secret_item: Optional<boolean> = false;

  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
    this.secret_item = TreasureManager.getInstance().registerAlifeItem(this);
  }

  /**
   * todo: Description.
   */
  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  /**
   * todo: Description.
   */
  public override can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return super.can_switch_online();
  }
}
