import { cse_alife_helicopter } from "xray16";

import { TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("Helicopter");

/**
 * todo;
 */
@LuabindClass()
export class Helicopter extends cse_alife_helicopter {
  public constructor(section: TSection) {
    super(section);
  }

  public override on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);
  }

  public override on_unregister(): void {
    unregisterStoryObjectById(this.id);
    super.on_unregister();
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
