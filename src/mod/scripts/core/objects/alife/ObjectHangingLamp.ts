import { cse_alife_object_hanging_lamp, LuabindClass } from "xray16";

import { Optional, TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { TreasureManager } from "@/mod/scripts/core/managers/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ObjectHangingLamp extends cse_alife_object_hanging_lamp {
  public secret_item: Optional<boolean> = false;

  public constructor(section: TSection) {
    super(section);
  }

  public override on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);

    this.secret_item = TreasureManager.getInstance().registerAlifeItem(this);
  }

  public override on_unregister(): void {
    unregisterStoryObjectById(this.id);
    super.on_unregister();
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }

  public override can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return super.can_switch_online();
  }
}
