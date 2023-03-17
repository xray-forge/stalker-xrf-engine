import { cse_alife_item_helmet, LuabindClass } from "xray16";

import { Optional } from "@/engine/lib/types";
import { StoryObjectsManager } from "@/engine/scripts/core/managers/StoryObjectsManager";
import { TreasureManager } from "@/engine/scripts/core/managers/TreasureManager";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ItemHelmet extends cse_alife_item_helmet {
  public secret_item: Optional<boolean> = false;

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    StoryObjectsManager.checkSpawnIniForStoryId(this);
    this.secret_item = TreasureManager.getInstance().registerAlifeItem(this);
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    StoryObjectsManager.unregisterStoryObjectById(this.id);
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
