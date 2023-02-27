import { cse_alife_item } from "xray16";

import { Optional, TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ItemEatable");

/**
 * todo;
 */
@LuabindClass()
export class ItemEatable extends cse_alife_item {
  public secret_item: Optional<boolean> = false;

  public constructor(section: TSection) {
    super(section);
  }

  public on_register(): void {
    super.on_register();
    checkSpawnIniForStoryId(this);

    this.secret_item = getTreasureManager().register_item(this);
  }

  public on_unregister(): void {
    unregisterStoryObjectById(this.id);
    super.on_unregister();
  }

  public can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return super.can_switch_online();
  }
}
