import { cse_alife_helicopter, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/scripts/core/database";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Helicopter extends cse_alife_helicopter {
  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  /**
   * todo;
   */
  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
