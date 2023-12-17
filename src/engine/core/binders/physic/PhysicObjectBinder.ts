import { callback, level, LuabindClass, object_binder } from "xray16";

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
import { BoxManager } from "@/engine/core/managers/box";
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

  public state!: IRegistryObjectState;

  public override reinit(): void {
    super.reinit();
    this.state = resetObject(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.format("Go online: %s", object.name());

    const spawnIni: Optional<IniFile> = this.object.spawn_ini() as Optional<IniFile>;

    if (spawnIni) {
      if (spawnIni.section_exist("level_spot") && spawnIni.line_exist("level_spot", "actor_box")) {
        level.map_add_object_spot(this.object.id(), "ui_pda2_actor_box_location", "st_ui_pda_actor_box");
      }
    }

    registerObject(this.object);

    return true;
  }

  public override net_destroy(): void {
    logger.format("Go offline: %s", this.object.name());

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

    unregisterObject(this.object);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (!this.isInitialized && registry.actor !== null) {
      this.isInitialized = true;
      initializeObjectSchemeLogic(this.object, this.state, this.isLoaded, ESchemeType.OBJECT);
    }

    if (this.state.activeScheme) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme] as IBaseSchemeState, ESchemeEvent.UPDATE, delta);
    }

    getManager(GlobalSoundManager).update(this.object.id());

    this.setupCallbacks();
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
   * Setup binder callback on going online.
   */
  public setupCallbacks(): void {
    this.object.set_callback(callback.hit, this.onHit, this);
    this.object.set_callback(callback.death, this.onDeath, this);
    this.object.set_callback(callback.use_object, this.onUse, this);
  }

  /**
   * Handle object being used.
   *
   * @param object - game object being used
   * @param who - game object using it
   */
  public onUse(object: GameObject, who: GameObject): void {
    logger.format("Object used: %s by %s", object.name(), object.section(), who.name());

    if (this.state.activeScheme) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme] as IBaseSchemeState,
        ESchemeEvent.USE,
        object,
        who
      );
    }
  }

  /**
   * Handle object being hit.
   * Emit corresponding event to capture them with activated schemes.
   *
   * @param object - game object being hit
   * @param amount - amount of damage with hit
   * @param direction - direction of the hit relative to current object
   * @param who - object hitting current object
   * @param boneIndex - index of the bone being hit
   */
  public onHit(object: GameObject, amount: TCount, direction: Vector, who: GameObject, boneIndex: TIndex): void {
    // logger.format("Object hit: %s by %s", object.name(), object.section(), who.name());

    if (this.state[EScheme.HIT]) {
      emitSchemeEvent(
        this.object,
        this.state[EScheme.HIT] as IBaseSchemeState,
        ESchemeEvent.HIT,
        object,
        amount,
        direction,
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
        direction,
        who,
        boneIndex
      );
    }
  }

  /**
   * Handle destruction of the physical object.
   *
   * @param object - target game object that was killed/destroyed
   * @param who - game object that destroyed it
   */
  public onDeath(object: GameObject, who: GameObject): void {
    logger.format("Object destroyed: %s by %s", object.name(), object.section(), who.name());

    if (this.state.activeScheme) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme] as IBaseSchemeState,
        ESchemeEvent.DEATH,
        object,
        who
      );
    }

    const spawnIni: Optional<IniFile> = this.object.spawn_ini();

    if (spawnIni && spawnIni.section_exist("drop_box")) {
      getManager(BoxManager).spawnDropBoxItems(this.object);
    }
  }
}
