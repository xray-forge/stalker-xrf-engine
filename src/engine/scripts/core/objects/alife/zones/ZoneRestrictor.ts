import { cse_alife_space_restrictor, LuabindClass } from "xray16";

import { StoryObjectsManager } from "@/engine/scripts/core/managers/StoryObjectsManager";
import { TreasureManager } from "@/engine/scripts/core/managers/TreasureManager";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: On unregister remove from manager story id?
 */
@LuabindClass()
export class ZoneRestrictor extends cse_alife_space_restrictor {
  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    StoryObjectsManager.checkSpawnIniForStoryId(this);
    TreasureManager.getInstance().registerAlifeRestrictor(this);
  }

  /**
   * todo;
   */
  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
