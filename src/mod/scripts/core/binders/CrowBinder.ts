import { AnyCallable } from "@/mod/lib/types";
import { addObject, CROW_STORAGE, deleteObject, storage } from "@/mod/scripts/core/db";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/binders/CrowBinder");

const CROW_DISPOSAL_TIMEOUT: number = 120_000;

export interface ICrowBinder extends XR_object_binder {
  bodyDisposalTimer: number;

  death_callback(victim: XR_game_object, killer: XR_game_object): void;
}

export const CrowBinder: ICrowBinder = declare_xr_class("CrowBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);

    this.bodyDisposalTimer = 0;

    log.info("Crow init");
  },
  update(delta: number): void {
    object_binder.update(this, delta);

    if (
      !this.object.alive() &&
      this.bodyDisposalTimer !== 0 &&
      time_global() - CROW_DISPOSAL_TIMEOUT >= this.bodyDisposalTimer
    ) {
      const sim: XR_alife_simulator = alife();

      log.info("Release dead crow");
      sim.release(sim.object(this.object.id()), true);
    }
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    this.bodyDisposalTimer = 0;

    storage.set(this.object.id(), {});
  },
  net_spawn(object: IXR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    log.info("Crow net spawn");

    const objectId: number = this.object.id();

    addObject(this.object);

    CROW_STORAGE.STORAGE.set(objectId, objectId);
    CROW_STORAGE.COUNT = CROW_STORAGE.COUNT + 1;

    this.object.set_callback(callback.death, this.death_callback, this);

    return true;
  },
  net_destroy(): void {
    log.info("Crow net destroy");

    this.object.set_callback(callback.death, null);

    CROW_STORAGE.STORAGE.delete(this.object.id());
    CROW_STORAGE.COUNT = CROW_STORAGE.COUNT - 1;

    deleteObject(this.object);

    object_binder.net_destroy(this);
  },
  death_callback(victim: XR_game_object, killer: XR_game_object): void {
    log.info("Crow death registered");

    this.bodyDisposalTimer = time_global();
    CROW_STORAGE.STORAGE.delete(this.object.id());
    CROW_STORAGE.COUNT = CROW_STORAGE.COUNT - 1;
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "CrowBinder");

    object_binder.save(this, packet);
    (get_global("xr_logic").save_obj as AnyCallable)(this.object, packet);
    packet.w_u32(this.bodyDisposalTimer);

    setSaveMarker(packet, true, "CrowBinder");
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "CrowBinder");
    object_binder.load(this, packet);
    (get_global("xr_logic").load_obj as AnyCallable)(this.object, packet);

    this.bodyDisposalTimer = packet.r_u32();
    setLoadMarker(packet, true, "CrowBinder");
  }
} as ICrowBinder);
