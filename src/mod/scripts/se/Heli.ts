import { cse_alife_helicopter, XR_cse_alife_helicopter } from "xray16";

import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("Heli");

export interface IHeli extends XR_cse_alife_helicopter {}

export const Heli: IHeli = declare_xr_class("Heli", cse_alife_helicopter, {
  __init(section: string): void {
    xr_class_super(section);
  },
  on_register(): void {
    cse_alife_helicopter.on_register(this);
    log.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_helicopter.on_unregister(this);
  },
  keep_saved_data_anyway(): boolean {
    return true;
  }
} as IHeli);
