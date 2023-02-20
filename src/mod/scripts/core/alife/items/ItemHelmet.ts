import { cse_alife_item_helmet, XR_cse_alife_item_helmet } from "xray16";

import { Optional, TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/db/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("Helmet");

export interface IItemHelmet extends XR_cse_alife_item_helmet {
  secret_item: Optional<boolean>;
}

export const ItemHelmet: IItemHelmet = declare_xr_class("ItemHelmet", cse_alife_item_helmet, {
  __init(section: TSection): void {
    cse_alife_item_helmet.__init(this, section);
    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_helmet.on_register(this);
    checkSpawnIniForStoryId(this);
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
  },
} as IItemHelmet);
