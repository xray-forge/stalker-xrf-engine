import {
  callback,
  clsid,
  level,
  object_binder,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_object_binder,
  XR_particles_object,
  XR_vector
} from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { addObject, deleteObject, getActor, IStoredObject, levelDoors, storage } from "@/mod/scripts/core/db";
import { stype_item } from "@/mod/scripts/core/schemes";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("PhysicObjectBinder");

export interface IPhysicObjectBinder extends XR_object_binder {
  initialized: boolean;
  loaded: boolean;
  particle: Optional<XR_particles_object>;
  st: IStoredObject;

  box_items: Optional<any>;

  use_callback(object: XR_game_object, who: XR_game_object): void;
  hit_callback(
    object: XR_game_object,
    damage: number,
    direction: XR_vector,
    who: XR_game_object,
    bone_id: number
  ): void;
  death_callback(victim: XR_game_object, who: XR_game_object): void;
}

export const PhysicObjectBinder: IPhysicObjectBinder = declare_xr_class("PhysicObjectBinder", object_binder, {
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

    this.st = storage.get(this.object.id());
  },
  net_destroy(): void {
    if (level.map_has_object_spot(this.object.id(), "ui_pda2_actor_box_location") !== 0) {
      level.map_remove_object_spot(this.object.id(), "ui_pda2_actor_box_location");
    }

    get_global<AnyCallablesModule>("xr_sound").stop_sounds_by_id(this.object.id());

    const st = storage.get(this.object.id());

    if (st.active_scheme) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(this.object, st[st.active_scheme], "net_destroy");
    }

    const on_offline_condlist = st?.overrides?.on_offline_condlist;

    if (on_offline_condlist !== null) {
      get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(
        getActor(),
        this.object,
        on_offline_condlist
      );
    }

    if (this.particle !== null) {
      this.particle.stop();
    }

    deleteObject(this.object);

    storage.delete(this.object.id());

    object_binder.net_destroy(this);
  },
  net_save_relevant(): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    object_binder.save(this, packet);
    setSaveMarker(packet, false, PhysicObjectBinder.__name);
    get_global<AnyCallablesModule>("xr_logic").save_obj(this.object, packet);
    setSaveMarker(packet, true, PhysicObjectBinder.__name);
  },
  load(packet: XR_net_packet): void {
    this.loaded = true;

    object_binder.load(this, packet);
    setLoadMarker(packet, false, PhysicObjectBinder.__name);
    get_global<AnyCallablesModule>("xr_logic").load_obj(this.object, packet);
    setLoadMarker(packet, true, PhysicObjectBinder.__name);
  },
  use_callback(object: XR_game_object, who: XR_game_object): void {
    if (this.st.active_section) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st[this.st.active_scheme as string],
        "use_callback",
        object,
        this
      );
    }
  },
  hit_callback(
    obj: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: XR_game_object,
    bone_index: number
  ): void {
    if (this.st.ph_on_hit) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st.ph_on_hit,
        "hit_callback",
        obj,
        amount,
        const_direction,
        who,
        bone_index
      );
    }

    if (this.st.active_section) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st[this.st.active_scheme as string],
        "hit_callback",
        obj,
        amount,
        const_direction,
        who,
        bone_index
      );
    }
  },
  death_callback(victim: XR_game_object, who: XR_game_object): void {
    if (this.st.active_section) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st[this.st.active_scheme as string],
        "death_callback",
        victim,
        who
      );
    }

    if (this.particle !== null) {
      this.particle.stop();
    }

    const spawn_ini: Optional<XR_ini_file> = this.object.spawn_ini();

    if (spawn_ini !== null && spawn_ini.section_exist("drop_box")) {
      this.box_items.spawn_items();
    }
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    if (this.object.section() === "physic_door") {
      levelDoors.set(this.object.id(), this.object.position());
    }

    const spawn_ini: Optional<XR_ini_file> = this.object.spawn_ini();

    if (spawn_ini !== null) {
      if (spawn_ini.section_exist("drop_box")) {
        this.box_items = get_global<AnyCallablesModule>("xr_box").ph_item_box(this.object);
      }

      if (spawn_ini.section_exist("level_spot")) {
        if (spawn_ini.line_exist("level_spot", "actor_box")) {
          level.map_add_object_spot(this.object.id(), "ui_pda2_actor_box_location", "st_ui_pda_actor_box");
        }
      }
    }

    addObject(this.object);

    return true;
  },
  update(delta: number): void {
    object_binder.update(this, delta);

    if (!this.initialized && getActor() !== null) {
      this.initialized = true;
      get_global<AnyCallablesModule>("xr_logic").initialize_obj(
        this.object,
        this.st,
        this.loaded,
        getActor(),
        stype_item
      );
    }

    this.object.info_clear();

    const active_section = storage.get(this.object.id()).active_section;

    if (!active_section !== null) {
      this.object.info_add("section: " + active_section);
    }

    this.object.info_add("name: [" + this.object.name() + "] id [" + this.object.id() + "]");

    const spawn_ini: Optional<XR_ini_file> = this.object.spawn_ini();

    if (this.st.active_section !== null || (spawn_ini !== null && spawn_ini.section_exist("drop_box") == true)) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st[this.st.active_scheme as string],
        "update",
        delta
      );
      this.object.set_callback(callback.hit, this.hit_callback, this);
      this.object.set_callback(callback.death, this.death_callback, this);
      this.object.set_callback(callback.use_object, this.use_callback, this);
    }

    if (this.object.clsid() == clsid.inventory_box) {
      this.object.set_callback(callback.use_object, this.use_callback, this);
    }

    get_global<AnyCallablesModule>("xr_sound").update(this.object.id());
  }
} as IPhysicObjectBinder);
