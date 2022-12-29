import { cse_alife_item_pda, XR_cse_alife_item_pda } from "xray16";

import { Optional } from "@/mod/lib/types";
import { REGISTERED_ITEMS } from "@/mod/scripts/core/db";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("items/ItemPda");

export interface IItemPda extends XR_cse_alife_item_pda {
  secret_item: Optional<boolean>;
}

export const ItemPda: IItemPda = declare_xr_class("ItemPda", cse_alife_item_pda, {
  __init(section: string): void {
    xr_class_super(section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_pda.on_register(this);
    checkSpawnIniForStoryId(this);
    this.secret_item = getTreasureManager().register_item(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_item_pda.on_unregister(this);
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_item_pda.can_switch_online(this);
  }
} as IItemPda);
