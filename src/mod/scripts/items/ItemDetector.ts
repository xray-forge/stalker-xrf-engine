import { cse_alife_item_detector, XR_cse_alife_item_detector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { REGISTERED_ITEMS } from "@/mod/scripts/core/db";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("items/ItemDetector");

export interface IItemDetector extends XR_cse_alife_item_detector {
  secret_item: Optional<boolean>;
}

export const ItemDetector: IItemDetector = declare_xr_class("ItemDetector", cse_alife_item_detector, {
  __init(section: string): void {
    xr_class_super(section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_detector.on_register(this);

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
    cse_alife_item_detector.on_unregister(this);
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_item_detector.can_switch_online(this);
  }
} as IItemDetector);
