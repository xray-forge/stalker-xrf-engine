import { cse_alife_space_restrictor, XR_cse_alife_space_restrictor } from "xray16";

import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("anomal_zones/ZoneRestrictor");

export interface IZoneRestrictor extends XR_cse_alife_space_restrictor {}

export const ZoneRestrictor: IZoneRestrictor = declare_xr_class("ZoneRestrictor", cse_alife_space_restrictor, {
  __init(section: string): void {
    xr_class_super(section);
  },
  on_register(): void {
    cse_alife_space_restrictor.on_register(this);
    checkSpawnIniForStoryId(this);
    getTreasureManager().register_restrictor(this);
  },
  keep_saved_data_anyway(): boolean {
    return true;
  }
} as IZoneRestrictor);
