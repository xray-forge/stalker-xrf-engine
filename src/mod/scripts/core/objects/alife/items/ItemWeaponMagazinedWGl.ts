import { cse_alife_item_weapon_magazined_w_gl, LuabindClass } from "xray16";

import { Optional, TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { TreasureManager } from "@/mod/scripts/core/managers/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
@LuabindClass()
export class ItemWeaponMagazinedWGl extends cse_alife_item_weapon_magazined_w_gl {
  public secret_item: Optional<boolean> = false;

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
    this.secret_item = TreasureManager.getInstance().registerAlifeItem(this);
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
  public override can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return super.can_switch_online();
  }
}
