import { cse_alife_item_pda, XR_cse_alife_item_pda } from "xray16";

import { Optional } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/configuration";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ItemPda");

export interface IItemPda extends XR_cse_alife_item_pda {
  secret_item: Optional<boolean>;
}

export const ItemPda: IItemPda = declare_xr_class("ItemPda", cse_alife_item_pda, {
  __init(section: TSection): void {
    cse_alife_item_pda.__init(this, section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_item_pda.on_register(this);
    logger.info("Register:", this.id, this.name(), this.section_name());
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
  },
} as IItemPda);
