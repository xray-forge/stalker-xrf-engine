import { cse_alife_item_helmet, XR_cse_alife_item_helmet } from "xray16";

import { Optional } from "@/mod/lib/types";
import { REGISTERED_ITEMS } from "@/mod/scripts/core/db";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("items/Helmet");

export interface IItemHelmet extends XR_cse_alife_item_helmet {
  secret_item: Optional<boolean>;
}

export const ItemHelmet: IItemHelmet = declare_xr_class("ItemHelmet", cse_alife_item_helmet, {
  __init(section: string): void {
    xr_class_super(section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_helmet.on_register(this);
    log.info("Register:", this.id, this.name(), this.section_name());
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
    cse_alife_item_helmet.on_unregister(this);
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_item_helmet.can_switch_online(this);
  }
} as IItemHelmet);
