import { callback, clsid, cond, hit, level, LuabindClass, move, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  IBaseSchemeState,
  IRegistryObjectState,
  IRegistryOfflineState,
  loadObjectLogic,
  openLoadMarker,
  openSaveMarker,
  registerObject,
  registry,
  resetObject,
  saveObjectLogic,
  unregisterObject,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ISmartTerrainJobDescriptor } from "@/engine/core/objects/smart_terrain/job";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { ESquadActionType } from "@/engine/core/objects/squad";
import { Squad } from "@/engine/core/objects/squad/Squad";
import { SchemeHear } from "@/engine/core/schemes/shared/hear/SchemeHear";
import { assert } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  emitSchemeEvent,
  isMonsterScriptCaptured,
  scriptCaptureMonster,
  scriptCommandMonster,
  scriptReleaseMonster,
  setupObjectSmartJobsAndLogicOnSpawn,
  trySwitchToAnotherSection,
} from "@/engine/core/utils/scheme";
import { getObjectSquad } from "@/engine/core/utils/squad";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { MAX_U16 } from "@/engine/lib/constants/memory";
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
  TClassId,
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

  public override update(delta: TDuration): void {
    super.update(delta);

    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();
    const squad: Optional<Squad> = getObjectSquad(this.object);
    const isSquadCommander: boolean = squad?.commander_id() === objectId;

    if (registry.actorCombat.has(objectId) && !this.object.best_enemy()) {
      registry.actorCombat.delete(objectId);
    }

    if (!this.object.alive()) {
      return;
    }

    this.object.set_tip_text("");

    if (this.state.activeScheme) {
      trySwitchToAnotherSection(this.object, this.state[this.state.activeScheme] as IBaseSchemeState);
    }

    if (isSquadCommander) {
      (squad as Squad).update();
    }

    // todo: Is it possible?
    if (registry.simulator.object(objectId) === null) {
      return;
    }

    if (this.object.get_enemy()) {
      if (isMonsterScriptCaptured(this.object)) {
        scriptReleaseMonster(this.object);
      }

      return;
    }

    if (squad?.currentAction?.type === ESquadActionType.REACH_TARGET) {
      const currentTarget: Optional<TSimulationObject> = registry.simulationObjects.get(squad.assignedTargetId!);

      if (!currentTarget) {
        return;
      }

      const targetPosition: Vector = currentTarget.position;

      scriptCaptureMonster(object, true);

      if (isSquadCommander) {
        scriptCommandMonster(object, new move(move.walk_with_leader, targetPosition), new cond(cond.move_end));
      } else {
        const commanderPosition: Vector = registry.simulator.object(squad.commander_id())!.position;

        if (commanderPosition.distance_to_sqr(object.position()) > 100) {
          scriptCommandMonster(object, new move(move.run_with_leader, targetPosition), new cond(cond.move_end));
        } else {
          scriptCommandMonster(object, new move(move.walk_with_leader, targetPosition), new cond(cond.move_end));
        }
      }

      // todo: Is return needed?
      return;
    }

    if (this.state.activeScheme) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme] as IBaseSchemeState, ESchemeEvent.UPDATE, delta);
    }
  }

  public override net_spawn(serverObject: ServerCreatureObject): boolean {
    if (!super.net_spawn(serverObject)) {
      return false;
    }

    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();

    // todo: Previous state offline condlist? Is it possible?
    const onOfflineConditionsList: Optional<TConditionList> = registry.objects.get(objectId)?.overrides
      ?.onOffline as Optional<TConditionList>;

    if (onOfflineConditionsList) {
      pickSectionFromCondList(registry.actor, object, onOfflineConditionsList);
    }

    if (!object.alive()) {
      return true;
    }

    const serverMonsterObject: ServerCreatureObject = registry.simulator.object(objectId)!;

    // todo: Is it possible?
    if (serverMonsterObject === null) {
      return false;
    }

    registerObject(object);

    if (registry.spawnedVertexes.has(objectId)) {
      object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(objectId)));
      registry.spawnedVertexes.delete(objectId);
    } else if (registry.offlineObjects.get(objectId)?.levelVertexId) {
      object.set_npc_position(level.vertex_position(registry.offlineObjects.get(objectId).levelVertexId as TNumberId));
    } else if (serverMonsterObject.m_smart_terrain_id !== MAX_U16) {
      const smartTerrain: Optional<SmartTerrain> = registry.simulator.object<SmartTerrain>(
        serverMonsterObject.m_smart_terrain_id
      );

      if (smartTerrain && !smartTerrain.arrivingObjects.get(objectId)) {
        const job: Optional<ISmartTerrainJobDescriptor> = smartTerrain.objectJobDescriptors.get(objectId).job;
        const smartTerrainTask: ALifeSmartTerrainTask = job?.alifeTask as ALifeSmartTerrainTask;

        assert(
          smartTerrainTask,
          "Expected terrain task to exist when spawning in smart terrain: '%s' in '%s', job: '%s'.",
          object.name(),
          smartTerrain.name(),
          job?.section
        );

        object.set_npc_position(smartTerrainTask.position());
      }
    }

    setupObjectSmartJobsAndLogicOnSpawn(object, this.state, ESchemeType.MONSTER, this.isLoaded);

    return true;
  }

  public override net_destroy(): void {
    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();
    const state: IRegistryObjectState = this.state;

    object.set_callback(callback.death, null);
    object.set_callback(callback.patrol_path_in_point, null);
    object.set_callback(callback.hit, null);
    object.set_callback(callback.sound, null);

    getManager(GlobalSoundManager).stopSoundByObjectId(objectId);
    registry.actorCombat.delete(objectId);

    if (state.activeScheme) {
      emitSchemeEvent(object, state[state.activeScheme] as IBaseSchemeState, ESchemeEvent.SWITCH_OFFLINE, object);
    }

    const offlineObject: Optional<IRegistryOfflineState> = registry.offlineObjects.get(
      objectId
    ) as Optional<IRegistryOfflineState>;

    if (offlineObject) {
      offlineObject.levelVertexId = object.level_vertex_id();
      offlineObject.activeSection = state.activeSection;
    }

    unregisterObject(object);

    super.net_destroy();
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
  public onDeath(victim: GameObject, killer: GameObject): void {
    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();
    const state: IRegistryObjectState = this.state;

    logger.info("Monster death:", object.name());

    registry.actorCombat.delete(objectId);

    this.onHit(victim, 1, createEmptyVector(), killer, "from_death_callback");

    if (state[EScheme.MOB_DEATH]) {
      emitSchemeEvent(object, state[EScheme.MOB_DEATH], ESchemeEvent.DEATH, victim, killer);
    }

    if (state.activeScheme) {
      emitSchemeEvent(object, state[state.activeScheme] as IBaseSchemeState, ESchemeEvent.DEATH, victim, killer);
    }

    const hitObject: Hit = new hit();

    hitObject.draftsman = object;
    hitObject.type = hit.fire_wound;
    hitObject.direction = registry.actor.position().sub(object.position());
    hitObject.bone("pelvis");
    hitObject.power = 1;
    hitObject.impulse = 10;

    object.hit(hitObject);

    const objectClsId: TClassId = object.clsid();

    if (objectClsId === clsid.poltergeist_s) {
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
