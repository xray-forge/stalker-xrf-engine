import { object_binder, XR_cse_alife_object, XR_game_object, XR_net_packet, XR_object_binder } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { addObject, addZone, deleteObject, deleteZone, getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { stype_restrictor } from "@/mod/scripts/core/schemes";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("RestrictorBinder");

export interface IRestrictorBinder extends XR_object_binder {
  initialized: boolean;
  loaded: boolean;
  st: IStoredObject;
}

export const RestrictorBinder: IRestrictorBinder = declare_xr_class("RestrictorBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);

    this.initialized = false;
    this.loaded = false;
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    this.st = {};

    storage.set(this.object.id(), this.st);
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    addZone(this.object);
    addObject(this.object);

    const obj_id = this.object.id();

    if (get_global("xr_sound").looped_sound[obj_id]) {
      for (const [k, v] of pairs(get_global("xr_sound").looped_sound[obj_id])) {
        get_global<AnyCallablesModule>("xr_sound").play_sound_looped(obj_id, k);
      }
    }

    const ini = this.object.spawn_ini();

    if (!ini) {
      return true;
    }

    if (ini.section_exist("information_sector")) {
      get_global<AnyCallablesModule>("sr_danger").register_new_sector(this.object);
    }

    if (ini.section_exist("apply_on_combat")) {
      get_global<AnyCallablesModule>("combat_restrictor").register_combat_restrictor(this.object);
    }

    return true;
  },
  net_destroy(): void {
    get_global("xr_sound").stop_sounds_by_id(this.object.id());

    const st = storage.get(this.object.id());

    if (st.active_scheme !== null) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        st[st.active_scheme as string],
        "net_destroy"
      );
    }

    deleteZone(this.object);
    deleteObject(this.object);

    storage.delete(this.object.id());

    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    if (!this.initialized && getActor() !== null) {
      this.initialized = true;

      get_global<AnyCallablesModule>("xr_logic").initialize_obj(
        this.object,
        this.st,
        this.loaded,
        getActor(),
        stype_restrictor
      );
    }

    this.object.info_clear();

    const active_section = storage.has(this.object.id()) && storage.get(this.object.id()).active_section;

    if (active_section !== null) {
      this.object.info_add("section: " + active_section);
    }

    this.object.info_add("name: [" + this.object.name() + "] id [" + this.object.id() + "]");

    if (this.st.active_section !== null) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st[this.st.active_scheme as string],
        "update",
        delta
      );
    }

    get_global<AnyCallablesModule>("xr_sound").update(this.object.id());
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, RestrictorBinder.__name);
    object_binder.save(this, packet);

    get_global<AnyCallablesModule>("xr_logic").save_obj(this.object, packet);
    setSaveMarker(packet, true, RestrictorBinder.__name);
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, RestrictorBinder.__name);

    this.loaded = true;

    object_binder.load(this, packet);

    get_global<AnyCallablesModule>("xr_logic").load_obj(this.object, packet);
    setLoadMarker(packet, true, RestrictorBinder.__name);
  }
} as IRestrictorBinder);
