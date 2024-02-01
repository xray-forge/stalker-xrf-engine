import { cse_alife_level_changer, LuabindClass } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openSaveMarker,
  registerObjectStoryLinks,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { NetPacket, TLabel } from "@/engine/lib/types";

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
    EventsManager.emitEvent(EGameEvent.LEVEL_CHANGER_REGISTERED, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.LEVEL_CHANGER_UNREGISTERED, this);
    unregisterStoryLinkByObjectId(this.id);

    super.on_unregister();
  }

  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, LevelChanger.__name);
    packet.w_bool(this.isEnabled);
    packet.w_stringZ(this.invitationHint);
    closeSaveMarker(packet, LevelChanger.__name);
  }

  public override STATE_Read(packet: NetPacket, size: number): void {
    super.STATE_Read(packet, size);

    openLoadMarker(packet, LevelChanger.__name);
    this.isEnabled = packet.r_bool();
    this.invitationHint = packet.r_stringZ();
    closeLoadMarker(packet, LevelChanger.__name);
  }
}
