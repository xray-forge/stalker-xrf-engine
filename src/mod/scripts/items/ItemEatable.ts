import { cse_alife_item, XR_cse_alife_item } from "xray16";

import { Optional } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("items/ItemEatable");

export interface IItemEatable extends XR_cse_alife_item {
  secret_item: Optional<boolean>;
}

export const ItemEatable: IItemEatable = declare_xr_class("ItemEatable", cse_alife_item, {
  __init(section: string): void {
    xr_class_super(section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item.on_register(this);
    checkSpawnIniForStoryId(this);
    this.secret_item = getTreasureManager().register_item(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_item.on_unregister(this);
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_item.can_switch_online(this);
  }
} as IItemEatable);
