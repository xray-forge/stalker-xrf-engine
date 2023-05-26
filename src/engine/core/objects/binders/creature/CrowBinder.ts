import {
  alife,
  alife_simulator,
  callback,
  cse_alife_object,
  game_object,
  LuabindClass,
  net_packet,
  object_binder,
  reader,
  time_global,
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
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { TDuration, TNumberId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class CrowBinder extends object_binder {
  public diedAt: TTimestamp = 0;

  public override reinit(): void {
    super.reinit();

    this.diedAt = 0;

    resetObject(this.object);
  }

  public override net_spawn(object: cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    const objectId: TNumberId = this.object.id();

    registerObject(this.object);

    registry.crows.storage.set(objectId, objectId);
    registry.crows.count += 1;

    this.object.set_callback(callback.death, this.onDeath, this);

    return true;
  }

  public override net_destroy(): void {
    logger.info("Crow net destroy");

    this.object.set_callback(callback.death, null);

    registry.crows.storage.delete(this.object.id());
    registry.crows.count -= 1;

    unregisterObject(this.object);

    super.net_destroy();
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (
      !this.object.alive() &&
      this.diedAt !== 0 &&
      time_global() - logicsConfig.CROW_CORPSE_RELEASE_TIMEOUT >= this.diedAt
    ) {
      const simulator: alife_simulator = alife();

      logger.info("Release dead crow");
      simulator.release(simulator.object(this.object.id()), true);
    }
  }

  public override save(packet: net_packet): void {
    openSaveMarker(packet, CrowBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);
    packet.w_u32(this.diedAt);

    closeSaveMarker(packet, CrowBinder.__name);
  }

  public override load(reader: reader): void {
    openLoadMarker(reader, CrowBinder.__name);
    super.load(reader);
    loadObjectLogic(this.object, reader);

    this.diedAt = reader.r_u32();
    closeLoadMarker(reader, CrowBinder.__name);
  }

  /**
   * On crow object death.
   */
  public onDeath(victim: game_object, killer: game_object): void {
    logger.info("Crow death registered");

    this.diedAt = time_global();
    registry.crows.storage.delete(this.object.id());
    registry.crows.count -= 1;
  }
}
