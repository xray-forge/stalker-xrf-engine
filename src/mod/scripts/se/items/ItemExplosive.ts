import { cse_alife_item_explosive, XR_cse_alife_item } from "xray16";

import { Optional } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/configuration";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ItemExplosive");

export interface IItemExplosive extends XR_cse_alife_item {
  secret_item: Optional<boolean>;
}

export const ItemExplosive: IItemExplosive = declare_xr_class("ItemExplosive", cse_alife_item_explosive, {
  __init(section: TSection): void {
    cse_alife_item_explosive.__init(this, section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_explosive.on_register(this);
    logger.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);

    this.secret_item = getTreasureManager().register_item(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_item_explosive.on_unregister(this);
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_item_explosive.can_switch_online(this);
  }
} as IItemExplosive);
