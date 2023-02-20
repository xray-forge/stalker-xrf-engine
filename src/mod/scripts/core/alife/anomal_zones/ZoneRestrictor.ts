import { cse_alife_space_restrictor, XR_cse_alife_space_restrictor } from "xray16";

import { TSection } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/db/StoryObjectsRegistry";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ZoneRestrictor");

export interface IZoneRestrictor extends XR_cse_alife_space_restrictor {}

export const ZoneRestrictor: IZoneRestrictor = declare_xr_class("ZoneRestrictor", cse_alife_space_restrictor, {
  __init(section: TSection): void {
    cse_alife_space_restrictor.__init(this, section);
  },
  on_register(): void {
    cse_alife_space_restrictor.on_register(this);

    logger.info("Register:", this.id, this.name(), this.section_name());

    checkSpawnIniForStoryId(this);
    getTreasureManager().register_restrictor(this);
  },
  keep_saved_data_anyway(): boolean {
    return true;
  },
} as IZoneRestrictor);