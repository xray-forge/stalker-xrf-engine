import {
  callback,
  clsid,
  level,
  object_binder,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_particles_object,
  XR_reader,
  XR_vector,
} from "xray16";

import { ESchemeType, Optional } from "@/mod/lib/types";
import { PhysicObjectItemBox } from "@/mod/scripts/core/binders/PhysicObjectItemBox";
import { addObject, deleteObject, IStoredObject, registry, resetObject } from "@/mod/scripts/core/database";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { initializeGameObject } from "@/mod/scripts/core/schemes/initializeGameObject";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { SchemePhysicalOnHit } from "@/mod/scripts/core/schemes/ph_on_hit/SchemePhysicalOnHit";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("PhysicObjectBinder");

/**
 * todo;
 */
@LuabindClass()
export class PhysicObjectBinder extends object_binder {
  public initialized: boolean = false;
  public loaded: boolean = false;

  public particle: Optional<XR_particles_object> = null;
  public itemBox: Optional<PhysicObjectItemBox> = null;

  public st!: IStoredObject;

  public constructor(object: XR_game_object) {
    super(object);
  }

  public reload(section: string): void {
    super.reload(section);
  }

  public reinit(): void {
    super.reinit();
    this.st = resetObject(this.object);
  }

  public net_destroy(): void {
    if (level.map_has_object_spot(this.object.id(), "ui_pda2_actor_box_location") !== 0) {
      level.map_remove_object_spot(this.object.id(), "ui_pda2_actor_box_location");
    }

    GlobalSound.stop_sounds_by_id(this.object.id());

    const st = registry.objects.get(this.object.id());

    if (st.active_scheme) {
      issueEvent(this.object, st[st.active_scheme], "net_destroy");
    }

    const on_offline_condlist = st?.overrides?.on_offline_condlist;

    if (on_offline_condlist !== null) {
      pickSectionFromCondList(registry.actor, this.object, on_offline_condlist as any);
    }

    if (this.particle !== null) {
      this.particle.stop();
    }

    deleteObject(this.object);

    registry.objects.delete(this.object.id());

    super.net_destroy();
  }

  public net_save_relevant(): boolean {
    return true;
  }

  public save(packet: XR_net_packet): void {
    super.save(packet);

    setSaveMarker(packet, false, PhysicObjectBinder.__name);
    save_obj(this.object, packet);
    setSaveMarker(packet, true, PhysicObjectBinder.__name);
  }

  public load(reader: XR_reader): void {
    this.loaded = true;

    super.load(reader);

    setLoadMarker(reader, false, PhysicObjectBinder.__name);
    load_obj(this.object, reader);
    setLoadMarker(reader, true, PhysicObjectBinder.__name);
  }

  public use_callback(object: XR_game_object, who: XR_game_object): void {
    if (this.st.active_section) {
      issueEvent(this.object, this.st[this.st.active_scheme as string], "use_callback", object, this);
    }
  }

  public hit_callback(
    obj: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: XR_game_object,
    bone_index: number
  ): void {
    if (this.st[SchemePhysicalOnHit.SCHEME_SECTION]) {
      issueEvent(
        this.object,
        this.st[SchemePhysicalOnHit.SCHEME_SECTION],
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
  }

  public death_callback(victim: XR_game_object, who: XR_game_object): void {
    if (this.st.active_section) {
      issueEvent(this.object, this.st[this.st.active_scheme as string], "death_callback", victim, who);
    }

    if (this.particle !== null) {
      this.particle.stop();
    }

    if (this.itemBox !== null) {
      this.itemBox.spawnBoxItems();
    }
  }

  public net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    const spawn_ini: Optional<XR_ini_file> = this.object.spawn_ini();

    if (spawn_ini !== null) {
      if (spawn_ini.section_exist("drop_box")) {
        this.itemBox = new PhysicObjectItemBox(this.object);
      }

      if (spawn_ini.section_exist("level_spot")) {
        if (spawn_ini.line_exist("level_spot", "actor_box")) {
          level.map_add_object_spot(this.object.id(), "ui_pda2_actor_box_location", "st_ui_pda_actor_box");
        }
      }
    }

    addObject(this.object);

    return true;
  }

  public update(delta: number): void {
    super.update(delta);

    if (!this.initialized) {
      this.initialized = true;
      initializeGameObject(this.object, this.st, this.loaded, registry.actor, ESchemeType.ITEM);
    }

    this.object.info_clear();

    const active_section = registry.objects.get(this.object.id()).active_section;

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
  }
}
