import { cse_alife_level_changer, LuabindClass, XR_net_packet } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openSaveMarker,
  registerObjectStoryLinks,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TLabel } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Level changer space restrictor.
 * Used to teleport to another location when actor reaches one of them.
 */
@LuabindClass()
export class LevelChanger extends cse_alife_level_changer {
  public enabled: boolean = true;
  public hint: TLabel = "level_changer_invitation";

  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());
    registerObjectStoryLinks(this);
  }

  public override on_unregister(): void {
    logger.info("Unregister:", this.name());
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, LevelChanger.__name);
    packet.w_bool(this.enabled);
    packet.w_stringZ(this.hint);
    closeSaveMarker(packet, LevelChanger.__name);
  }

  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    openLoadMarker(packet, LevelChanger.__name);
    this.enabled = packet.r_bool();
    this.hint = packet.r_stringZ();
    closeLoadMarker(packet, LevelChanger.__name);
  }
}
