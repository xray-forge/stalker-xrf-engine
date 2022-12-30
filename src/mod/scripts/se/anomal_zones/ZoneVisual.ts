import { cse_zone_visual, editor, game, system_ini, XR_cse_zone_visual, XR_CTime, XR_net_packet } from "xray16";

import { Optional } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getConfigNumber } from "@/mod/scripts/utils/configs";
import { isSinglePlayerGame } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

const log: LuaLogger = new LuaLogger("ZoneVisual");

export interface IZoneVisual extends XR_cse_zone_visual {
  last_spawn_time: Optional<XR_CTime>;
  artefact_spawn_idle: number;
  artefact_spawn_rnd: number;
}

export const ZoneVisual: IZoneVisual = declare_xr_class("ZoneVisual", cse_zone_visual, {
  __init(section: string) {
    xr_class_super(section);
  },
  on_register(): void {
    cse_zone_visual.on_register(this);

    log.info("Register:", this.id, this.name(), this.section_name());

    checkSpawnIniForStoryId(this);

    this.artefact_spawn_idle =
      60 * 60 * 1000 * getConfigNumber(system_ini(), this.section_name(), "artefact_spawn_idle", this, false, 24);
    this.artefact_spawn_rnd = getConfigNumber(
      system_ini(),
      this.section_name(),
      "artefact_spawn_rnd",
      this,
      false,
      100
    );
  },
  update(): void {
    cse_zone_visual.update(this);

    if (this.last_spawn_time == null) {
      this.last_spawn_time = game.get_game_time();
    }

    if (game.get_game_time().diffSec(this.last_spawn_time) >= this.artefact_spawn_idle) {
      this.last_spawn_time = game.get_game_time();
      if (math.random(100) <= this.artefact_spawn_rnd) {
        // todo: Commented in XR engine?
        log.warn("Wanted to spawn artefacts, but missing in original engine functionality used");
        // this.spawn_artefacts();
      }
    }
  },
  STATE_Write(packet: XR_net_packet): void {
    cse_zone_visual.STATE_Write(this, packet);

    if (!isSinglePlayerGame()) {
      return;
    }

    if (this.last_spawn_time === null) {
      packet.w_u8(0);
    } else {
      packet.w_u8(1);
      writeCTimeToPacket(packet, this.last_spawn_time);
    }
  },
  STATE_Read(packet: XR_net_packet, size: number): void {
    cse_zone_visual.STATE_Read(this, packet, size);

    if (editor()) {
      return;
    }

    if (!isSinglePlayerGame()) {
      return;
    }

    const flag = packet.r_u8();

    if (flag === 1) {
      this.last_spawn_time = readCTimeFromPacket(packet);
    }
  }
} as IZoneVisual);
