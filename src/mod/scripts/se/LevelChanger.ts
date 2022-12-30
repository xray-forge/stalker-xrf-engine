import { XR_cse_alife_level_changer, cse_alife_level_changer, XR_net_packet, editor } from "xray16";

import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("LevelChanger");

export interface ILevelChanger extends XR_cse_alife_level_changer {
  enabled: boolean;
  hint: string;
}

export const LevelChanger: ILevelChanger = declare_xr_class("LevelChanger", cse_alife_level_changer, {
  __init(section: string): void {
    xr_class_super(section);

    this.enabled = true;
    this.hint = "level_changer_invitation";
  },
  on_register(): void {
    cse_alife_level_changer.on_register(this);
    log.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    cse_alife_level_changer.on_unregister(this);
    log.info("Unregister:", this.name());
  },
  STATE_Write(packet: XR_net_packet): void {
    cse_alife_level_changer.STATE_Write(this, packet);

    setSaveMarker(packet, false, "LevelChanger");
    packet.w_bool(this.enabled);
    packet.w_stringZ(this.hint);
    setSaveMarker(packet, true, "LevelChanger");
  },
  STATE_Read(packet: XR_net_packet, size: number): void {
    cse_alife_level_changer.STATE_Read(this, packet, size);

    if (editor()) {
      return;
    }

    setLoadMarker(packet, false, "LevelChanger");
    this.enabled = packet.r_bool();
    this.hint = packet.r_stringZ();
    setLoadMarker(packet, true, "LevelChanger");
  }
} as ILevelChanger);
