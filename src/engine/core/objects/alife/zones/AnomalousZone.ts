import { cse_anomalous_zone, editor, game, LuabindClass, system_ini, XR_CTime, XR_net_packet } from "xray16";

import { registerObjectStoryLinks } from "@/engine/core/database";
import { isSinglePlayerGame } from "@/engine/core/utils/general";
import { getConfigNumber } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/core/utils/time";
import { Optional, TDuration } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class AnomalousZone extends cse_anomalous_zone {
  public artefact_spawn_idle: TDuration = 0;
  public artefact_spawn_rnd: number = 0;
  public last_spawn_time: Optional<XR_CTime> = null;

  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());

    registerObjectStoryLinks(this);

    this.artefact_spawn_idle =
      60 * 60 * 1000 * getConfigNumber(system_ini(), this.section_name(), "artefact_spawn_idle", false, 24);
    this.artefact_spawn_rnd = getConfigNumber(system_ini(), this.section_name(), "artefact_spawn_rnd", false, 100);
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    super.update();

    if (this.last_spawn_time === null) {
      this.last_spawn_time = game.get_game_time();
    }

    if (game.get_game_time().diffSec(this.last_spawn_time) >= this.artefact_spawn_idle) {
      if (math.random(100) <= this.artefact_spawn_rnd) {
        // todo: Commented in XR engine?
        logger.warn("Wanted to spawn artefacts, but missing in original engine functionality used");
        // this.spawn_artefacts();
      }
    }
  }

  /**
   * todo: Description.
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    if (!isSinglePlayerGame()) {
      return;
    }

    if (this.last_spawn_time === null) {
      packet.w_u8(0);
    } else {
      packet.w_u8(1);
      writeCTimeToPacket(packet, this.last_spawn_time);
    }
  }

  /**
   * todo: Description.
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (editor() || !isSinglePlayerGame()) {
      return;
    }

    const flag = packet.r_u8();

    if (flag === 1) {
      this.last_spawn_time = readCTimeFromPacket(packet);
    }
  }
}
