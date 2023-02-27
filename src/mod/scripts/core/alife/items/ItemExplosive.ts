import { cse_alife_item_explosive } from "xray16";

import { Optional, TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ItemExplosive");

/**
 * todo;
 */
@LuabindClass()
export class ItemExplosive extends cse_alife_item_explosive {
  public secret_item: Optional<boolean> = false;

  public constructor(section: TSection) {
    super(section);
  }

  public on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
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
