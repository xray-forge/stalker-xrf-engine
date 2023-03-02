import { cse_alife_space_restrictor } from "xray16";

import { TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { TreasureManager } from "@/mod/scripts/core/managers/TreasureManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ZoneRestrictor");

/**
 * todo;
 */
@LuabindClass()
export class ZoneRestrictor extends cse_alife_space_restrictor {
  public constructor(section: TSection) {
    super(section);
  }

  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());

    checkSpawnIniForStoryId(this);
    TreasureManager.getInstance().registerAlifeRestrictor(this);
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
