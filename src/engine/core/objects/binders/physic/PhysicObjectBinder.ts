import { callback, clsid, level, LuabindClass, object_binder } from "xray16";

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
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ESchemeEvent } from "@/engine/core/objects/ai/scheme";
import { PhysicObjectItemBox } from "@/engine/core/objects/binders/physic/PhysicObjectItemBox";
import { pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { emitSchemeEvent, initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import {
  ClientObject,
  EScheme,
  ESchemeType,
  IniFile,
  NetPacket,
  Optional,
  ParticlesObject,
  Reader,
  ServerObject,
  TCount,
  TDuration,
  TIndex,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class PhysicObjectBinder extends object_binder {
  public initialized: boolean = false;
  public loaded: boolean = false;

  public particle: Optional<ParticlesObject> = null;
  public itemBox: Optional<PhysicObjectItemBox> = null;

  public state!: IRegistryObjectState;

  public override reinit(): void {
    super.reinit();
    this.state = resetObject(this.object);
  }

  public override net_destroy(): void {
    if (level.map_has_object_spot(this.object.id(), "ui_pda2_actor_box_location") !== 0) {
      level.map_remove_object_spot(this.object.id(), "ui_pda2_actor_box_location");
    }

    GlobalSoundManager.getInstance().stopSoundByObjectId(this.object.id());

    const state: IRegistryObjectState = registry.objects.get(this.object.id());

    if (state.activeScheme) {
      emitSchemeEvent(this.object, state[state.activeScheme]!, ESchemeEvent.SWITCH_OFFLINE, this.object);
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

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    super.save(packet);

    openSaveMarker(packet, PhysicObjectBinder.__name);
    saveObjectLogic(this.object, packet);
    closeSaveMarker(packet, PhysicObjectBinder.__name);
  }

  public override load(reader: Reader): void {
    this.loaded = true;

    super.load(reader);

    openLoadMarker(reader, PhysicObjectBinder.__name);
    loadObjectLogic(this.object, reader);
    closeLoadMarker(reader, PhysicObjectBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    const spawnIni: Optional<IniFile> = this.object.spawn_ini();

    if (spawnIni !== null) {
      if (spawnIni.section_exist("drop_box")) {
        this.itemBox = new PhysicObjectItemBox(this.object);
      }

      if (spawnIni.section_exist("level_spot")) {
        if (spawnIni.line_exist("level_spot", "actor_box")) {
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
      initializeObjectSchemeLogic(this.object, this.state, this.loaded, ESchemeType.ITEM);
    }

    const spawnIni: Optional<IniFile> = this.object.spawn_ini();

    if (this.state.activeSection !== null || (spawnIni !== null && spawnIni.section_exist("drop_box"))) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.UPDATE, delta);
      this.object.set_callback(callback.hit, this.onHit, this);
      this.object.set_callback(callback.death, this.onDeath, this);
      this.object.set_callback(callback.use_object, this.onUse, this);
    }

    if (this.object.clsid() === clsid.inventory_box) {
      this.object.set_callback(callback.use_object, this.onUse, this);
    }

    GlobalSoundManager.getInstance().update(this.object.id());
  }

  /**
   * todo: Description.
   */
  public onUse(object: ClientObject, who: ClientObject): void {
    if (this.state.activeSection) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.USE, object, this);
    }
  }

  /**
   * todo: Description.
   */
  public onHit(
    object: ClientObject,
    amount: TCount,
    constDirection: Vector,
    who: ClientObject,
    boneIndex: TIndex
  ): void {
    if (this.state[EScheme.HIT]) {
      emitSchemeEvent(
        this.object,
        this.state[EScheme.HIT]!,
        ESchemeEvent.HIT,
        object,
        amount,
        constDirection,
        who,
        boneIndex
      );
    }

    if (this.state.activeSection) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme!]!,
        ESchemeEvent.HIT,
        object,
        amount,
        constDirection,
        who,
        boneIndex
      );
    }
  }

  /**
   * todo: Description.
   */
  public onDeath(victim: ClientObject, who: ClientObject): void {
    if (this.state.activeSection) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.DEATH, victim, who);
    }

    if (this.particle !== null) {
      this.particle.stop();
    }

    if (this.itemBox !== null) {
      this.itemBox.spawnBoxItems();
    }
  }
}
