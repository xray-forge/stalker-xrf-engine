import {
  callback,
  clsid,
  level,
  LuabindClass,
  object_binder,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_particles_object,
  XR_reader,
  XR_vector,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registerObject,
  registry,
  resetObject,
  unregisterObject,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { PhysicObjectItemBox } from "@/engine/core/objects/binders/PhysicObjectItemBox";
import { ESchemeEvent } from "@/engine/core/schemes";
import { emitSchemeEvent } from "@/engine/core/schemes/base/utils";
import { initializeObjectSchemeLogic } from "@/engine/core/schemes/base/utils/initializeObjectSchemeLogic";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TConditionList } from "@/engine/core/utils/parse";
import { EScheme, ESchemeType, Optional, TCount, TDuration, TIndex } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class PhysicObjectBinder extends object_binder {
  public initialized: boolean = false;
  public loaded: boolean = false;

  public particle: Optional<XR_particles_object> = null;
  public itemBox: Optional<PhysicObjectItemBox> = null;

  public state!: IRegistryObjectState;

  /**
   * todo: Description.
   */
  public constructor(object: XR_game_object) {
    super(object);
  }

  /**
   * todo: Description.
   */
  public override reload(section: string): void {
    super.reload(section);
  }

  /**
   * todo: Description.
   */
  public override reinit(): void {
    super.reinit();
    this.state = resetObject(this.object);
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    if (level.map_has_object_spot(this.object.id(), "ui_pda2_actor_box_location") !== 0) {
      level.map_remove_object_spot(this.object.id(), "ui_pda2_actor_box_location");
    }

    GlobalSoundManager.getInstance().stopSoundByObjectId(this.object.id());

    const state: IRegistryObjectState = registry.objects.get(this.object.id());

    if (state.active_scheme) {
      emitSchemeEvent(this.object, state[state.active_scheme]!, ESchemeEvent.NET_DESTROY);
    }

    const on_offline_condlist: Optional<TConditionList> = state?.overrides?.on_offline_condlist;

    if (on_offline_condlist !== null) {
      pickSectionFromCondList(registry.actor, this.object, on_offline_condlist);
    }

    if (this.particle !== null) {
      this.particle.stop();
    }

    unregisterObject(this.object);

    registry.objects.delete(this.object.id());

    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    super.save(packet);

    openSaveMarker(packet, PhysicObjectBinder.__name);
    saveObjectLogic(this.object, packet);
    closeSaveMarker(packet, PhysicObjectBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    this.loaded = true;

    super.load(reader);

    openLoadMarker(reader, PhysicObjectBinder.__name);
    loadObjectLogic(this.object, reader);
    closeLoadMarker(reader, PhysicObjectBinder.__name);
  }

  /**
   * todo: Description.
   */
  public use_callback(object: XR_game_object, who: XR_game_object): void {
    if (this.state.active_section) {
      emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.USE, object, this);
    }
  }

  /**
   * todo: Description.
   */
  public hit_callback(
    obj: XR_game_object,
    amount: TCount,
    const_direction: XR_vector,
    who: XR_game_object,
    bone_index: TIndex
  ): void {
    if (this.state[EScheme.HIT]) {
      emitSchemeEvent(
        this.object,
        this.state[EScheme.HIT]!,
        ESchemeEvent.HIT,
        obj,
        amount,
        const_direction,
        who,
        bone_index
      );
    }

    if (this.state.active_section) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.active_scheme!]!,
        ESchemeEvent.HIT,
        obj,
        amount,
        const_direction,
        who,
        bone_index
      );
    }
  }

  /**
   * todo: Description.
   */
  public death_callback(victim: XR_game_object, who: XR_game_object): void {
    if (this.state.active_section) {
      emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.DEATH, victim, who);
    }

    if (this.particle !== null) {
      this.particle.stop();
    }

    if (this.itemBox !== null) {
      this.itemBox.spawnBoxItems();
    }
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
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

    registerObject(this.object);

    return true;
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    super.update(delta);

    if (!this.initialized) {
      this.initialized = true;
      initializeObjectSchemeLogic(this.object, this.state, this.loaded, registry.actor, ESchemeType.ITEM);
    }

    this.object.info_clear();

    const active_section = registry.objects.get(this.object.id()).active_section;

    if (!active_section !== null) {
      this.object.info_add("section: " + active_section);
    }

    this.object.info_add("name: [" + this.object.name() + "] id [" + this.object.id() + "]");

    const spawn_ini: Optional<XR_ini_file> = this.object.spawn_ini();

    if (this.state.active_section !== null || (spawn_ini !== null && spawn_ini.section_exist("drop_box"))) {
      emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.UPDATE, delta);
      this.object.set_callback(callback.hit, this.hit_callback, this);
      this.object.set_callback(callback.death, this.death_callback, this);
      this.object.set_callback(callback.use_object, this.use_callback, this);
    }

    if (this.object.clsid() === clsid.inventory_box) {
      this.object.set_callback(callback.use_object, this.use_callback, this);
    }

    GlobalSoundManager.getInstance().update(this.object.id());
  }
}
