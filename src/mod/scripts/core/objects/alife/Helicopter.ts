import { cse_alife_helicopter, LuabindClass } from "xray16";

import { TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Helicopter extends cse_alife_helicopter {
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
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    unregisterStoryObjectById(this.id);
    super.on_unregister();
  }

  /**
   * todo;
   */
  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
