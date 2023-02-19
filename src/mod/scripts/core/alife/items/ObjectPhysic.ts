import { cse_alife_object_physic, XR_cse_alife_object_physic } from "xray16";

import { Optional, TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/db/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ObjectPhysic");

export interface IObjectPhysic extends XR_cse_alife_object_physic {
  secret_item: Optional<boolean>;
}

export const ObjectPhysic: IObjectPhysic = declare_xr_class("ObjectPhysic", cse_alife_object_physic, {
  __init(section: TSection): void {
    cse_alife_object_physic.__init(this, section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_object_physic.on_register(this);
    logger.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);

    this.secret_item = getTreasureManager().register_item(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_object_physic.on_unregister(this);
  },
  keep_saved_data_anyway(): boolean {
    return true;
  },
  can_switch_online(): boolean {
    if (this.secret_item) {
      return false;
    }

    return cse_alife_object_physic.can_switch_online(this);
  },
} as IObjectPhysic);
