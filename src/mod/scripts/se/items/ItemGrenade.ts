import { cse_alife_item_grenade, XR_cse_alife_item_grenade } from "xray16";

import { Optional } from "@/mod/lib/types";
import { REGISTERED_ITEMS } from "@/mod/scripts/core/db";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("items/ItemGrenade");

export interface IItemGrenade extends XR_cse_alife_item_grenade {
  secret_item: Optional<boolean>;
}

export const ItemGrenade: IItemGrenade = declare_xr_class("ItemGrenade", cse_alife_item_grenade, {
  __init(section: string): void {
    xr_class_super(section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_grenade.on_register(this);
    checkSpawnIniForStoryId(this);
    this.secret_item = getTreasureManager().register_item(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_item_grenade.on_unregister(this);
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_item_grenade.can_switch_online(this);
  }
} as IItemGrenade);
