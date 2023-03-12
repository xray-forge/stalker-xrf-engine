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

import { TNumberId, TSection } from "@/mod/lib/types";
import { registerObject, registry, resetObject, unregisterObject } from "@/mod/scripts/core/database";
import { loadObject, saveObject } from "@/mod/scripts/core/schemes/storing";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

const CROW_DISPOSAL_TIMEOUT: number = 120_000;

/**
 * todo;
 */
@LuabindClass()
export class CrowBinder extends object_binder {
  public bodyDisposalTimer: number = 0;

  public constructor(object: XR_game_object) {
    super(object);
  }

  public override update(delta: number): void {
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

  public override reload(section: TSection): void {
    super.reload(section);
  }

  public override reinit(): void {
    super.reinit();

    this.bodyDisposalTimer = 0;

    resetObject(this.object);
  }

  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Crow net spawn");

    const objectId: TNumberId = this.object.id();

    registerObject(this.object);

    registry.crows.storage.set(objectId, objectId);
    registry.crows.count += 1;

    this.object.set_callback(callback.death, this.death_callback, this);

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

  public death_callback(victim: XR_game_object, killer: XR_game_object): void {
    logger.info("Crow death registered");

    this.bodyDisposalTimer = time_global();
    registry.crows.storage.delete(this.object.id());
    registry.crows.count -= 1;
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, CrowBinder.__name);

    super.save(packet);
    saveObject(this.object, packet);
    packet.w_u32(this.bodyDisposalTimer);

    setSaveMarker(packet, true, CrowBinder.__name);
  }

  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, CrowBinder.__name);
    super.load(reader);
    loadObject(this.object, reader);

    this.bodyDisposalTimer = reader.r_u32();
    setLoadMarker(reader, true, CrowBinder.__name);
  }
}
