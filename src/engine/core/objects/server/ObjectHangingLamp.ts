import { cse_alife_object_hanging_lamp, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Hanging lamp object representation.
 * Generic moving lamp.
 */
@LuabindClass()
export class ObjectHangingLamp extends cse_alife_object_hanging_lamp {
  public isSecretItem: Optional<boolean> = false;

  public override on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
    registerObjectStoryLinks(this);
    this.isSecretItem = TreasureManager.getInstance().registerAlifeItem(this);
  }

  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }

  public override can_switch_online(): boolean {
    if (this.isSecretItem) {
      return false;
    }

    return super.can_switch_online();
  }
}
