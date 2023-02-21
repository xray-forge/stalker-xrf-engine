import { cse_alife_item_weapon_magazined_w_gl, XR_cse_alife_item_weapon_magazined_w_gl } from "xray16";

import { Optional, TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ItemWeaponMagazined");

export interface IItemWeaponMagazinedWGl extends XR_cse_alife_item_weapon_magazined_w_gl {
  secret_item: Optional<boolean>;
}

export const ItemWeaponMagazinedWGl: IItemWeaponMagazinedWGl = declare_xr_class(
  "ItemWeaponMagazinedWGl",
  cse_alife_item_weapon_magazined_w_gl,
  {
    __init(section: TSection): void {
      cse_alife_item_weapon_magazined_w_gl.__init(this, section);

      this.secret_item = false;
    },
    on_register(): void {
      cse_alife_item_weapon_magazined_w_gl.on_register(this);
      logger.info("Register:", this.id, this.name(), this.section_name());
      checkSpawnIniForStoryId(this);

      this.secret_item = getTreasureManager().register_item(this);
    },
    on_unregister(): void {
      unregisterStoryObjectById(this.id);
      cse_alife_item_weapon_magazined_w_gl.on_unregister(this);
    },
    can_switch_online(): boolean {
      if (this.secret_item) {
        return false;
      }

      return cse_alife_item_weapon_magazined_w_gl.can_switch_online(this);
    },
  } as IItemWeaponMagazinedWGl
);
