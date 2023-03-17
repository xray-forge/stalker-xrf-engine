import { cse_alife_space_restrictor, LuabindClass } from "xray16";

import { TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { TreasureManager } from "@/mod/scripts/core/managers/TreasureManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ZoneRestrictor extends cse_alife_space_restrictor {
  /**
   * todo;
   */
  public constructor(section: TSection) {
    super(section);
  }

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    checkSpawnIniForStoryId(this);
    TreasureManager.getInstance().registerAlifeRestrictor(this);
  }

  /**
   * todo;
   */
  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
