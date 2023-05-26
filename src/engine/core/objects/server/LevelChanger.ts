import { cse_alife_level_changer, LuabindClass, net_packet } from "xray16";

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
  public isEnabled: boolean = true;
  public invitationHint: TLabel = "level_changer_invitation";

  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
  }

  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override STATE_Write(packet: net_packet): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, LevelChanger.__name);
    packet.w_bool(this.isEnabled);
    packet.w_stringZ(this.invitationHint);
    closeSaveMarker(packet, LevelChanger.__name);
  }

  public override STATE_Read(packet: net_packet, size: number): void {
    super.STATE_Read(packet, size);

    openLoadMarker(packet, LevelChanger.__name);
    this.isEnabled = packet.r_bool();
    this.invitationHint = packet.r_stringZ();
    closeLoadMarker(packet, LevelChanger.__name);
  }
}
