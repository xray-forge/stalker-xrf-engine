import { cse_alife_object_hanging_lamp, XR_cse_alife_object_hanging_lamp } from "xray16";

import { Optional } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("items/ObjectHangingLamp");

export interface IObjectHangingLamp extends XR_cse_alife_object_hanging_lamp {
  secret_item: Optional<boolean>;
}

export const ObjectHangingLamp: IObjectHangingLamp = declare_xr_class(
  "ObjectHangingLamp",
  cse_alife_object_hanging_lamp,
  {
    __init(section: string): void {
      xr_class_super(section);
      this.secret_item = false;
    },
    on_register(): void {
      cse_alife_object_hanging_lamp.on_register(this);
      checkSpawnIniForStoryId(this);
      this.secret_item = getTreasureManager().register_item(this);
    },
    on_unregister(): void {
      unregisterStoryObjectById(this.id);
      cse_alife_object_hanging_lamp.on_unregister(this);
    },
    keep_saved_data_anyway(): boolean {
      return true;
    },
    can_switch_online(): boolean {
      if (this.secret_item) {
        return false;
      }

      return cse_alife_object_hanging_lamp.can_switch_online(this);
    }
  } as IObjectHangingLamp
);
