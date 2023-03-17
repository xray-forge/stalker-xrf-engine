import { cse_alife_object_physic, LuabindClass } from "xray16";

import { Optional } from "@/engine/lib/types";
import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/scripts/core/database";
import { TreasureManager } from "@/engine/scripts/core/managers/TreasureManager";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ObjectPhysic extends cse_alife_object_physic {
  public secret_item: Optional<boolean> = false;

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
    registerObjectStoryLinks(this);

    this.secret_item = TreasureManager.getInstance().registerAlifeItem(this);
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

  /**
   * todo;
   */
  public override can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return super.can_switch_online();
  }
}
