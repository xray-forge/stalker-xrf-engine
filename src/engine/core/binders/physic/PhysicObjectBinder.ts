import { callback, clsid, level, LuabindClass, object_binder } from "xray16";

import { PhysicObjectItemBox } from "@/engine/core/binders/physic/PhysicObjectItemBox";
import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  IBaseSchemeState,
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
import { pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { emitSchemeEvent, initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import {
  EScheme,
  ESchemeEvent,
  ESchemeType,
  GameObject,
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
 * Binder of physic game objects.
 */
@LuabindClass()
export class PhysicObjectBinder extends object_binder {
  public isInitialized: boolean = false;
  public isLoaded: boolean = false;

  public particle: Optional<ParticlesObject> = null;
  public itemBox: Optional<PhysicObjectItemBox> = null;

  public state!: IRegistryObjectState;

  public override reinit(): void {
    super.reinit();
    this.state = resetObject(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    const spawnIni: Optional<IniFile> = this.object.spawn_ini() as Optional<IniFile>;

    if (spawnIni) {
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

  public override net_destroy(): void {
    if (level.map_has_object_spot(this.object.id(), "ui_pda2_actor_box_location") !== 0) {
      level.map_remove_object_spot(this.object.id(), "ui_pda2_actor_box_location");
    }

    getManager(GlobalSoundManager).stopSoundByObjectId(this.object.id());

    const state: IRegistryObjectState = registry.objects.get(this.object.id());

    if (state.activeScheme) {
      emitSchemeEvent(this.object, state[state.activeScheme]!, ESchemeEvent.SWITCH_OFFLINE, this.object);
    }

    const onOfflineCondlist: Optional<TConditionList> = state?.overrides?.onOffline as Optional<TConditionList>;

    if (onOfflineCondlist) {
      pickSectionFromCondList(registry.actor, this.object, onOfflineCondlist);
    }

    if (this.particle) {
      this.particle.stop();
    }

    unregisterObject(this.object);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (!this.isInitialized) {
      this.isInitialized = true;
      initializeObjectSchemeLogic(this.object, this.state, this.isLoaded, ESchemeType.OBJECT);
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

    getManager(GlobalSoundManager).update(this.object.id());
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, PhysicObjectBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);

    closeSaveMarker(packet, PhysicObjectBinder.__name);
  }

  public override load(reader: Reader): void {
    this.isLoaded = true;

    openLoadMarker(reader, PhysicObjectBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, PhysicObjectBinder.__name);
  }

  /**
   * todo: Description.
   */
  public onUse(object: GameObject, who: GameObject): void {
    if (this.state.activeScheme) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme] as IBaseSchemeState,
        ESchemeEvent.USE,
        object,
        this
      );
    }
  }

  /**
   * todo: Description.
   */
  public onHit(object: GameObject, amount: TCount, constDirection: Vector, who: GameObject, boneIndex: TIndex): void {
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

    if (this.state.activeScheme) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme] as IBaseSchemeState,
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
  public onDeath(victim: GameObject, who: GameObject): void {
    if (this.state.activeScheme) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme] as IBaseSchemeState,
        ESchemeEvent.DEATH,
        victim,
        who
      );
    }

    if (this.particle) {
      this.particle.stop();
    }

    if (this.itemBox) {
      this.itemBox.spawnBoxItems();
    }
  }
}
