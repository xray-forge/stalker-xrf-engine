import { cse_alife_item_weapon_shotgun, LuabindClass } from "xray16";

import { Optional, TSection } from "@/engine/lib/types";
import { checkSpawnIniForStoryId } from "@/engine/scripts/core/database/StoryObjectsRegistry";
import { TreasureManager } from "@/engine/scripts/core/managers/TreasureManager";
import { unregisterStoryObjectById } from "@/engine/scripts/utils/alife";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ItemWeaponShotgun extends cse_alife_item_weapon_shotgun {
  public secret_item: Optional<boolean> = false;

  public constructor(section: TSection) {
    super(section);
  }

  public override on_register(): void {
    super.on_register();
    checkSpawnIniForStoryId(this);
    this.secret_item = TreasureManager.getInstance().registerAlifeItem(this);
  }

  public override on_unregister(): void {
    unregisterStoryObjectById(this.id);
    super.on_unregister();
  }

  public override can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return super.can_switch_online();
  }
}
