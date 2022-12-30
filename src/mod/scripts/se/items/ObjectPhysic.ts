import { cse_alife_object_physic, XR_cse_alife_object_physic } from "xray16";

import { Optional } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("items/ObjectPhysic");

export interface IObjectPhysic extends XR_cse_alife_object_physic {
  secret_item: Optional<boolean>;
}

export const ObjectPhysic: IObjectPhysic = declare_xr_class("ObjectPhysic", cse_alife_object_physic, {
  __init(section: string): void {
    xr_class_super(section);

    this.secret_item = false;
  },
  on_register(): void {
    cse_alife_object_physic.on_register(this);
    log.info("Register:", this.id, this.name(), this.section_name());
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
  }
} as IObjectPhysic);
