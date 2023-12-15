import { callback, clsid, hit, level, LuabindClass, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  IBaseSchemeState,
  IRegistryObjectState,
  loadObjectLogic,
  openLoadMarker,
  openSaveMarker,
  registerObject,
  registry,
  resetObject,
  saveObjectLogic,
  softResetOfflineObject,
  unregisterObject,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ISmartTerrainJobDescriptor } from "@/engine/core/objects/smart_terrain/job";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { Squad } from "@/engine/core/objects/squad/Squad";
import { updateMonsterSquadAction } from "@/engine/core/objects/squad/update";
import { SchemeHear } from "@/engine/core/schemes/shared/hear/SchemeHear";
import { assert } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  emitSchemeEvent,
  scriptReleaseMonster,
  setupObjectSmartJobsAndLogicOnSpawn,
  trySwitchToAnotherSection,
} from "@/engine/core/utils/scheme";
import { getObjectSquad } from "@/engine/core/utils/squad";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import {
  ALifeSmartTerrainTask,
  EScheme,
  ESchemeEvent,
  ESchemeType,
  GameObject,
  Hit,
  NetPacket,
  Optional,
  Reader,
  ServerCreatureObject,
  TCount,
  TDuration,
  TIndex,
  TLabel,
  TNumberId,
  TRate,
  TSoundType,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder of monster game objects.
 */
@LuabindClass()
export class MonsterBinder extends object_binder {
  public isLoaded: boolean = false;
  public state!: IRegistryObjectState;

  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);

    this.object.set_callback(callback.patrol_path_in_point, this.onWaypoint, this);
    this.object.set_callback(callback.hit, this.onHit, this);
    this.object.set_callback(callback.death, this.onDeath, this);
    this.object.set_callback(callback.sound, this.onHearSound, this);
  }

  public override net_spawn(serverObject: ServerCreatureObject): boolean {
    if (!super.net_spawn(serverObject)) {
      return false;
    }

    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();

    if (!object.alive()) {
      return true;
    }

    const monster: Optional<ServerCreatureObject> = registry.simulator.object(objectId);

    // todo: Is it possible?
    if (!monster) {
      return false;
    }

    this.state = registerObject(object);

    if (registry.spawnedVertexes.has(objectId)) {
      object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(objectId)));
      registry.spawnedVertexes.delete(objectId);
    } else if (registry.offlineObjects.get(objectId)?.levelVertexId) {
      object.set_npc_position(level.vertex_position(registry.offlineObjects.get(objectId).levelVertexId as TNumberId));
    } else if (monster.m_smart_terrain_id !== MAX_U16) {
      const smartTerrain: Optional<SmartTerrain> = registry.simulator.object<SmartTerrain>(monster.m_smart_terrain_id);

      if (smartTerrain && !smartTerrain.arrivingObjects.get(objectId)) {
        const job: Optional<ISmartTerrainJobDescriptor> = smartTerrain.objectJobDescriptors.get(objectId).job;
        const task: ALifeSmartTerrainTask = job?.alifeTask as ALifeSmartTerrainTask;

        assert(
          task,
          "Expected terrain task to exist when spawning in smart terrain: '%s' in '%s', job: '%s'.",
          object.name(),
          smartTerrain.name(),
          job?.section
        );

        object.set_npc_position(task.position());
      }
    }

    setupObjectSmartJobsAndLogicOnSpawn(object, this.state, ESchemeType.MONSTER, this.isLoaded);

    return true;
  }

  public override net_destroy(): void {
    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();
    const state: IRegistryObjectState = this.state;

    // todo: Reset callbacks method, reset also on death.
    object.set_callback(callback.patrol_path_in_point, null);
    object.set_callback(callback.death, null);
    object.set_callback(callback.sound, null);
    object.set_callback(callback.hit, null);

    getManager(GlobalSoundManager).stopSoundByObjectId(objectId);

    registry.actorCombat.delete(objectId);

    if (state.activeScheme) {
      emitSchemeEvent(object, state[state.activeScheme] as IBaseSchemeState, ESchemeEvent.SWITCH_OFFLINE, object);
    }

    const onOfflineConditionList: Optional<TConditionList> = state.overrides?.onOffline as Optional<TConditionList>;

    if (onOfflineConditionList) {
      pickSectionFromCondList(registry.actor, object, onOfflineConditionList);
    }

    softResetOfflineObject(objectId, {
      levelVertexId: object.level_vertex_id(),
      activeSection: state.activeSection,
    });

    unregisterObject(object);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();
    const state: IRegistryObjectState = this.state;
    const squad: Optional<Squad> = getObjectSquad(object);
    const isSquadCommander: boolean = squad?.commander_id() === objectId;

    // todo: Probably not needed, handle with death event.
    if (registry.actorCombat.has(objectId) && !object.best_enemy()) {
      registry.actorCombat.delete(objectId);
    }

    // Nothing to do after death.
    if (!object.alive()) {
      return;
    }

    object.set_tip_text("");

    if (state.activeScheme) {
      trySwitchToAnotherSection(object, state[state.activeScheme] as IBaseSchemeState);
    }

    if (isSquadCommander) {
      (squad as Squad).update();
    }

    // todo: Is it possible?
    if (!registry.simulator.object(objectId)) {
      return;
    }

    // In combat do not handle other logics elements.
    if (object.get_enemy()) {
      return scriptReleaseMonster(object);
    }

    if (squad) {
      updateMonsterSquadAction(object, squad);
    }

    if (state.activeScheme) {
      emitSchemeEvent(object, state[state.activeScheme] as IBaseSchemeState, ESchemeEvent.UPDATE, delta);
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, MonsterBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);

    closeSaveMarker(packet, MonsterBinder.__name);
  }

  public override load(reader: Reader): void {
    this.isLoaded = true;

    openLoadMarker(reader, MonsterBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, MonsterBinder.__name);
  }

  /**
   * On waypoint callback.
   */
  public onWaypoint(object: GameObject, actionType: number, index: TIndex): void {
    if (this.state.activeScheme) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme] as IBaseSchemeState,
        ESchemeEvent.WAYPOINT,
        object,
        actionType,
        index
      );
    }
  }

  /**
   * On monster death.
   */
  public onDeath(object: GameObject, killer: GameObject): void {
    const objectId: TNumberId = object.id();
    const state: IRegistryObjectState = this.state;

    logger.info("Monster death:", object.name());

    registry.actorCombat.delete(objectId);

    this.onHit(object, 1, ZERO_VECTOR, killer, "from_death_callback");

    if (state[EScheme.MOB_DEATH]) {
      emitSchemeEvent(object, state[EScheme.MOB_DEATH], ESchemeEvent.DEATH, object, killer);
    }

    if (state.activeScheme) {
      emitSchemeEvent(object, state[state.activeScheme] as IBaseSchemeState, ESchemeEvent.DEATH, object, killer);
    }

    const hitObject: Hit = new hit();

    hitObject.draftsman = object;
    hitObject.type = hit.fire_wound;
    hitObject.direction = registry.actor.position().sub(object.position());
    hitObject.bone("pelvis");
    hitObject.power = 1;
    hitObject.impulse = 10;

    object.hit(hitObject);

    // todo: Is it legacy code from SHOC or it is needed?
    if (object.clsid() === clsid.poltergeist_s) {
      logger.info("Releasing poltergeist_s:", object.name());

      const targetServerObject: Optional<ServerCreatureObject> = registry.simulator.object(objectId);

      if (targetServerObject) {
        registry.simulator.release(targetServerObject, true);
      }
    }

    EventsManager.emitEvent(EGameEvent.MONSTER_KILLED, object, killer);
  }

  /**
   * On monster hit by another object.
   */
  public onHit(
    object: GameObject,
    amount: TCount,
    direction: Vector,
    who: GameObject,
    boneIndex: TLabel | TIndex
  ): void {
    if (this.state[EScheme.HIT]) {
      emitSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, object, amount, direction, who, boneIndex);
    }

    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, object, amount, direction, who, boneIndex);
  }

  /**
   * On monster hear sound.
   * Handle surrounding sounds and process danger / aggression based on sound type and power.
   */
  public onHearSound(
    object: GameObject,
    sourceId: TNumberId,
    soundType: TSoundType,
    soundPosition: Vector,
    soundPower: TRate
  ): void {
    if (sourceId !== object.id()) {
      SchemeHear.onObjectHearSound(object, sourceId, soundType, soundPosition, soundPower);
    }
  }
}
