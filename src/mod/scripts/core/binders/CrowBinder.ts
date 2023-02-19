import {
  alife,
  callback,
  object_binder,
  time_global,
  XR_alife_simulator,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_object_binder,
  XR_reader,
} from "xray16";

import { addObject, deleteObject, registry } from "@/mod/scripts/core/db";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("CrowBinder");

const CROW_DISPOSAL_TIMEOUT: number = 120_000;

export interface ICrowBinder extends XR_object_binder {
  bodyDisposalTimer: number;

  death_callback(victim: XR_game_object, killer: XR_game_object): void;
}

export const CrowBinder: ICrowBinder = declare_xr_class("CrowBinder", object_binder, {
  __init(object: XR_game_object): void {
    object_binder.__init(this, object);

    this.bodyDisposalTimer = 0;

    logger.info("Crow init");
  },
  update(delta: number): void {
    object_binder.update(this, delta);

    if (
      !this.object.alive() &&
      this.bodyDisposalTimer !== 0 &&
      time_global() - CROW_DISPOSAL_TIMEOUT >= this.bodyDisposalTimer
    ) {
      const sim: XR_alife_simulator = alife();

      logger.info("Release dead crow");
      sim.release(sim.object(this.object.id()), true);
    }
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    this.bodyDisposalTimer = 0;

    registry.objects.set(this.object.id(), {});
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    logger.info("Crow net spawn");

    const objectId: number = this.object.id();

    addObject(this.object);

    registry.crows.storage.set(objectId, objectId);
    registry.crows.count += 1;

    this.object.set_callback(callback.death, this.death_callback, this);

    return true;
  },
  net_destroy(): void {
    logger.info("Crow net destroy");

    this.object.set_callback(callback.death, null);

    registry.crows.storage.delete(this.object.id());
    registry.crows.count -= 1;

    deleteObject(this.object);

    object_binder.net_destroy(this);
  },
  death_callback(victim: XR_game_object, killer: XR_game_object): void {
    logger.info("Crow death registered");

    this.bodyDisposalTimer = time_global();
    registry.crows.storage.delete(this.object.id());
    registry.crows.count -= 1;
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, CrowBinder.__name);

    object_binder.save(this, packet);
    save_obj(this.object, packet);
    packet.w_u32(this.bodyDisposalTimer);

    setSaveMarker(packet, true, CrowBinder.__name);
  },
  load(reader: XR_reader): void {
    setLoadMarker(reader, false, CrowBinder.__name);
    object_binder.load(this, reader);
    load_obj(this.object, reader);

    this.bodyDisposalTimer = reader.r_u32();
    setLoadMarker(reader, true, CrowBinder.__name);
  },
} as ICrowBinder);
