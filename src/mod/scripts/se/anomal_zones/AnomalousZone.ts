import { cse_anomalous_zone, editor, game, system_ini, XR_cse_anomalous_zone, XR_CTime, XR_net_packet } from "xray16";

import { Optional } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { getConfigNumber } from "@/mod/scripts/utils/configs";
import { isSinglePlayerGame } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

const log: LuaLogger = new LuaLogger("anomal_zones/AnomalousZone");

export interface IAnomalousZone extends XR_cse_anomalous_zone {
  m_registred: boolean;
  artefact_spawn_idle: number;
  artefact_spawn_rnd: number;

  last_spawn_time: Optional<XR_CTime>;
}

export const AnomalousZone = declare_xr_class("AnomalousZone", cse_anomalous_zone, {
  __init(section: string): void {
    xr_class_super(section);

    this.m_registred = false;
  },
  on_register(): void {
    cse_anomalous_zone.on_register(this);
    checkSpawnIniForStoryId(this);

    this.m_registred = true;
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
    cse_anomalous_zone.update(this);

    if (this.last_spawn_time === null) {
      this.last_spawn_time = game.get_game_time();
    }

    if (game.get_game_time().diffSec(this.last_spawn_time) >= this.artefact_spawn_idle) {
      if (math.random(100) <= this.artefact_spawn_rnd) {
        // todo: Commented in XR engine?
        log.warn("Wanted to spawn artefacts, but missing in original engine functionality used");
        // this.spawn_artefacts();
      }
    }
  },
  STATE_Write(packet: XR_net_packet): void {
    cse_anomalous_zone.STATE_Write(this, packet);

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
    cse_anomalous_zone.STATE_Read(this, packet, size);

    if (editor() || !isSinglePlayerGame()) {
      return;
    }

    const flag = packet.r_u8();

    if (flag === 1) {
      this.last_spawn_time = readCTimeFromPacket(packet);
    }
  }
} as IAnomalousZone);
