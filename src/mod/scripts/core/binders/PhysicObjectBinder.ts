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
  XR_reader,
  XR_vector,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { ESchemeType } from "@/mod/lib/types/configuration";
import { addObject, deleteObject, getActor, IStoredObject, levelDoors, storage } from "@/mod/scripts/core/db";
import { ItemBox } from "@/mod/scripts/core/ItemBox";
import { ActionOnHit } from "@/mod/scripts/core/logic/ActionOnHit";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { initializeGameObject } from "@/mod/scripts/core/schemes/initializeGameObject";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("PhysicObjectBinder");

export interface IPhysicObjectBinder extends XR_object_binder {
  initialized: boolean;
  loaded: boolean;
  particle: Optional<XR_particles_object>;
  st: IStoredObject;

  itemBox: Optional<ItemBox>;

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
    object_binder.__init(this, object);

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
  net_destroy(): void {
    if (level.map_has_object_spot(this.object.id(), "ui_pda2_actor_box_location") !== 0) {
      level.map_remove_object_spot(this.object.id(), "ui_pda2_actor_box_location");
    }

    GlobalSound.stop_sounds_by_id(this.object.id());

    const st = storage.get(this.object.id());

    if (st.active_scheme) {
      issueEvent(this.object, st[st.active_scheme], "net_destroy");
    }

    const on_offline_condlist = st?.overrides?.on_offline_condlist;

    if (on_offline_condlist !== null) {
      // todo ??? no assign
      pickSectionFromCondList(getActor(), this.object, on_offline_condlist as any);
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
    save_obj(this.object, packet);
    setSaveMarker(packet, true, PhysicObjectBinder.__name);
  },
  load(reader: XR_reader): void {
    this.loaded = true;

    object_binder.load(this, reader);

    setLoadMarker(reader, false, PhysicObjectBinder.__name);
    load_obj(this.object, reader);
    setLoadMarker(reader, true, PhysicObjectBinder.__name);
  },
  use_callback(object: XR_game_object, who: XR_game_object): void {
    if (this.st.active_section) {
      issueEvent(this.object, this.st[this.st.active_scheme as string], "use_callback", object, this);
    }
  },
  hit_callback(
    obj: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: XR_game_object,
    bone_index: number
  ): void {
    if (this.st[ActionOnHit.SCHEME_SECTION]) {
      issueEvent(
        this.object,
        this.st[ActionOnHit.SCHEME_SECTION],
        "hit_callback",
        obj,
        amount,
        const_direction,
        who,
        bone_index
      );
    }

    if (this.st.active_section) {
      issueEvent(
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
      issueEvent(this.object, this.st[this.st.active_scheme as string], "death_callback", victim, who);
    }

    if (this.particle !== null) {
      this.particle.stop();
    }

    if (this.itemBox !== null) {
      this.itemBox.spawnBoxItems();
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
        this.itemBox = new ItemBox(this.object);
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
      initializeGameObject(this.object, this.st, this.loaded, getActor()!, ESchemeType.ITEM);
    }

    this.object.info_clear();

    const active_section = storage.get(this.object.id()).active_section;

    if (!active_section !== null) {
      this.object.info_add("section: " + active_section);
    }

    this.object.info_add("name: [" + this.object.name() + "] id [" + this.object.id() + "]");

    const spawn_ini: Optional<XR_ini_file> = this.object.spawn_ini();

    if (this.st.active_section !== null || (spawn_ini !== null && spawn_ini.section_exist("drop_box"))) {
      issueEvent(this.object, this.st[this.st.active_scheme as string], "update", delta);
      this.object.set_callback(callback.hit, this.hit_callback, this);
      this.object.set_callback(callback.death, this.death_callback, this);
      this.object.set_callback(callback.use_object, this.use_callback, this);
    }

    if (this.object.clsid() === clsid.inventory_box) {
      this.object.set_callback(callback.use_object, this.use_callback, this);
    }

    GlobalSound.update(this.object.id());
  },
} as IPhysicObjectBinder);
