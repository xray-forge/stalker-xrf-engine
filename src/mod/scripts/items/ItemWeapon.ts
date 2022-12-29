import { cse_alife_item_weapon, XR_cse_alife_item_weapon } from "xray16";

import { Optional } from "@/mod/lib/types";
import { REGISTERED_ITEMS } from "@/mod/scripts/core/db";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("items/ItemWeapon");

export interface IItemWeapon extends XR_cse_alife_item_weapon {
  secret_item: Optional<boolean>;
}

export const ItemWeapon: IItemWeapon = declare_xr_class("ItemWeapon", cse_alife_item_weapon, {
  __init(section: string): void {
    xr_class_super(section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_weapon.on_register(this);

    checkSpawnIniForStoryId(this);

    if (REGISTERED_ITEMS.get(this.section_name()) == null) {
      REGISTERED_ITEMS.set(this.section_name(), 1);
    } else {
      REGISTERED_ITEMS.set(this.section_name(), REGISTERED_ITEMS.get(this.section_name()) + 1);
    }

    this.secret_item = getTreasureManager().register_item(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_item_weapon.on_unregister(this);
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_item_weapon.can_switch_online(this);
  }
} as IItemWeapon);
