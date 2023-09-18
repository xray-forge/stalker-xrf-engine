import { alife, callback, LuabindClass, object_binder, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  loadObjectLogic,
  openLoadMarker,
  openSaveMarker,
  registerObject,
  registry,
  resetObject,
  saveObjectLogic,
  unregisterObject,
} from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import {
  AlifeSimulator,
  ClientObject,
  NetPacket,
  Reader,
  ServerObject,
  TDuration,
  TNumberId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class CrowBinder extends object_binder {
  public diedAt: TTimestamp = 0;

  public override net_save_relevant(): boolean {
    return true;
  }
  public override reinit(): void {
    super.reinit();

    this.diedAt = 0;

    resetObject(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
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

  public override update(delta: TDuration): void {
    super.update(delta);

    if (
      this.diedAt !== 0 &&
      !this.object.alive() &&
      time_global() - logicsConfig.CROW_CORPSE_RELEASE_TIMEOUT >= this.diedAt
    ) {
      const simulator: AlifeSimulator = alife();

      logger.info("Release dead crow");
      simulator.release(simulator.object(this.object.id()), true);
    }
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, CrowBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);
    packet.w_u32(this.diedAt);

    closeSaveMarker(packet, CrowBinder.__name);
  }

  public override load(reader: Reader): void {
    openLoadMarker(reader, CrowBinder.__name);
    super.load(reader);
    loadObjectLogic(this.object, reader);

    this.diedAt = reader.r_u32();
    closeLoadMarker(reader, CrowBinder.__name);
  }

  /**
   * On crow object death.
   */
  public onDeath(victim: ClientObject, killer: ClientObject): void {
    logger.info("Crow death registered");

    this.diedAt = time_global();
    registry.crows.storage.delete(this.object.id());
    registry.crows.count -= 1;
  }
}
