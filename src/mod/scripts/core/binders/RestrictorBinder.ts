import { object_binder, XR_cse_alife_object, XR_game_object, XR_net_packet, XR_object_binder, XR_reader } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { addObject, addZone, deleteObject, deleteZone, IStoredObject } from "@/mod/scripts/core/db";
import { registry } from "@/mod/scripts/core/db/registry";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { initializeGameObject } from "@/mod/scripts/core/schemes/initializeGameObject";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("RestrictorBinder");

export interface IRestrictorBinder extends XR_object_binder {
  isInitialized: boolean;
  isLoaded: boolean;
  state: IStoredObject;
}

export const RestrictorBinder: IRestrictorBinder = declare_xr_class("RestrictorBinder", object_binder, {
  __init(object: XR_game_object): void {
    object_binder.__init(this, object);

    this.isInitialized = false;
    this.isLoaded = false;
  },
  reload(section: TSection): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    this.state = {};
    registry.objects.set(this.object.id(), this.state);
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    logger.info("Net spawn:", this.object.name());

    addZone(this.object);
    addObject(this.object);

    const objectId: number = this.object.id();

    if (GlobalSound.looped_sound.get(objectId) !== null) {
      for (const [k, v] of GlobalSound.looped_sound.get(objectId)) {
        GlobalSound.play_sound_looped(objectId, k);
      }
    }

    return true;
  },
  net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    GlobalSound.stop_sounds_by_id(this.object.id());

    const state: IStoredObject = this.state;

    if (state.active_scheme !== null) {
      issueEvent(this.object, state[state.active_scheme as string], "net_destroy");
    }

    deleteZone(this.object);
    deleteObject(this.object);

    registry.objects.delete(this.object.id());
    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    const activeSection: Optional<TSection> = this.state.active_section as Optional<TSection>;
    const objectId: number = this.object.id();

    if (!this.isInitialized) {
      this.isInitialized = true;

      initializeGameObject(this.object, this.state, this.isLoaded, registry.actor, ESchemeType.RESTRICTOR);
    }

    this.object.info_clear();

    if (activeSection !== null) {
      this.object.info_add("section: " + activeSection);
    }

    this.object.info_add("name: [" + this.object.name() + "] id [" + objectId + "]");

    if (this.state.active_section !== null) {
      issueEvent(this.object, this.state[this.state.active_scheme as string], "update", delta);
    }

    GlobalSound.update(objectId);
  },
  net_save_relevant(object: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, RestrictorBinder.__name);
    object_binder.save(this, packet);

    save_obj(this.object, packet);
    setSaveMarker(packet, true, RestrictorBinder.__name);
  },
  load(reader: XR_reader): void {
    setLoadMarker(reader, false, RestrictorBinder.__name);

    this.isLoaded = true;

    object_binder.load(this, reader);

    load_obj(this.object, reader);
    setLoadMarker(reader, true, RestrictorBinder.__name);
  },
} as IRestrictorBinder);
