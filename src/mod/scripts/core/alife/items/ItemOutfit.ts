import { cse_alife_item_custom_outfit, XR_cse_alife_item_custom_outfit } from "xray16";

import { Optional, TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/db/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ItemOutfit");

export interface IItemOutfit extends XR_cse_alife_item_custom_outfit {
  secret_item: Optional<boolean>;
}

export const ItemOutfit: IItemOutfit = declare_xr_class("ItemOutfit", cse_alife_item_custom_outfit, {
  __init(section: TSection): void {
    cse_alife_item_custom_outfit.__init(this, section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_custom_outfit.on_register(this);
    checkSpawnIniForStoryId(this);

    this.secret_item = getTreasureManager().register_item(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_item_custom_outfit.on_unregister(this);
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_item_custom_outfit.can_switch_online(this);
  },
} as IItemOutfit);
