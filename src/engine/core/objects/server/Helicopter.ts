import { cse_alife_helicopter, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Server representation of helicopter object.
 */
@LuabindClass()
export class Helicopter extends cse_alife_helicopter {
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }

  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
