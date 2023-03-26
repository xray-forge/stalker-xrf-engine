import {
  alife,
  callback,
  LuabindClass,
  object_binder,
  time_global,
  XR_alife_simulator,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_reader,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openSaveMarker,
  registerObject,
  registry,
  resetObject,
  unregisterObject,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TDuration, TNumberId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const CROW_DISPOSAL_TIMEOUT: TDuration = 120_000;

/**
 * todo;
 */
@LuabindClass()
export class CrowBinder extends object_binder {
  public bodyDisposalTimer: TTimestamp = 0;

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    super.update(delta);

    if (
      !this.object.alive() &&
      this.bodyDisposalTimer !== 0 &&
      time_global() - CROW_DISPOSAL_TIMEOUT >= this.bodyDisposalTimer
    ) {
      const sim: XR_alife_simulator = alife();

      logger.info("Release dead crow");
      sim.release(sim.object(this.object.id()), true);
    }
  }

  /**
   * todo: Description.
   */
  public override reinit(): void {
    super.reinit();

    this.bodyDisposalTimer = 0;

    resetObject(this.object);
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("New crow net spawn");

    const objectId: TNumberId = this.object.id();

    registerObject(this.object);

    registry.crows.storage.set(objectId, objectId);
    registry.crows.count += 1;

    this.object.set_callback(callback.death, this.death_callback, this);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    logger.info("Crow net destroy");

    this.object.set_callback(callback.death, null);

    registry.crows.storage.delete(this.object.id());
    registry.crows.count -= 1;

    unregisterObject(this.object);

    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public death_callback(victim: XR_game_object, killer: XR_game_object): void {
    logger.info("Crow death registered");

    this.bodyDisposalTimer = time_global();
    registry.crows.storage.delete(this.object.id());
    registry.crows.count -= 1;
  }

  /**
   * todo: Description.
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, CrowBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);
    packet.w_u32(this.bodyDisposalTimer);

    closeSaveMarker(packet, CrowBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    openLoadMarker(reader, CrowBinder.__name);
    super.load(reader);
    loadObjectLogic(this.object, reader);

    this.bodyDisposalTimer = reader.r_u32();
    closeLoadMarker(reader, CrowBinder.__name);
  }
}
