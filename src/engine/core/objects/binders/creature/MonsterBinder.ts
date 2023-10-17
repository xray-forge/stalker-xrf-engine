import { callback, clsid, cond, hit, level, LuabindClass, move, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IBaseSchemeState,
  IRegistryObjectState,
  IStoredOfflineObject,
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
import { ISmartTerrainJobDescriptor } from "@/engine/core/objects/server/smart_terrain/job";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { ESquadActionType } from "@/engine/core/objects/server/squad";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
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
 * todo;
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

    if (registry.actorCombat.get(this.object.id()) && this.object.best_enemy() === null) {
      registry.actorCombat.delete(this.object.id());
    }

    if (!this.object.alive()) {
      return;
    }

    this.object.set_tip_text("");

    if (this.state.activeScheme !== null) {
      trySwitchToAnotherSection(this.object, this.state[this.state.activeScheme as EScheme] as IBaseSchemeState);
    }

    const squad: Optional<Squad> = getObjectSquad(this.object);

    if (squad !== null && squad.commander_id() === this.object.id()) {
      squad.update();
    }

    if (registry.simulator.object(this.object.id()) === null) {
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

      if (currentTarget === null) {
        return;
      }

      const targetPosition: Vector = currentTarget.position;

      scriptCaptureMonster(this.object, true);

      if (squad.commander_id() === this.object.id()) {
        scriptCommandMonster(this.object, new move(move.walk_with_leader, targetPosition), new cond(cond.move_end));
      } else {
        const commanderPosition: Vector = registry.simulator.object(squad.commander_id())!.position;

        if (commanderPosition.distance_to_sqr(this.object.position()) > 100) {
          scriptCommandMonster(this.object, new move(move.run_with_leader, targetPosition), new cond(cond.move_end));
        } else {
          scriptCommandMonster(this.object, new move(move.walk_with_leader, targetPosition), new cond(cond.move_end));
        }
      }

      return;
    }

    if (this.state.activeSection !== null) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.UPDATE, delta);
    }
  }

  public override net_spawn(object: ServerCreatureObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    const state: IRegistryObjectState = registry.objects.get(this.object.id());
    const onOfflineConditionsList: Optional<TConditionList> = state?.overrides?.onOffline as Optional<TConditionList>;

    if (onOfflineConditionsList !== null) {
      pickSectionFromCondList(registry.actor, this.object, onOfflineConditionsList);
    }

    if (!this.object.alive()) {
      return true;
    }

    // todo: Is it possible?
    if (registry.simulator.object(this.object.id()) === null) {
      return false;
    }

    registerObject(this.object);

    // todo: Just use parameter?
    const serverObject: ServerCreatureObject = registry.simulator.object(this.object.id())!;

    if (registry.spawnedVertexes.has(serverObject.id)) {
      this.object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(serverObject.id)));
      registry.spawnedVertexes.delete(serverObject.id);
    } else if (registry.offlineObjects.get(serverObject.id)?.levelVertexId !== null) {
      this.object.set_npc_position(
        level.vertex_position(registry.offlineObjects.get(serverObject.id).levelVertexId as TNumberId)
      );
    } else if (serverObject.m_smart_terrain_id !== MAX_U16) {
      const smartTerrain: Optional<SmartTerrain> = registry.simulator.object<SmartTerrain>(
        serverObject.m_smart_terrain_id
      );

      if (smartTerrain !== null && smartTerrain.arrivingObjects.get(serverObject.id) === null) {
        const job: Optional<ISmartTerrainJobDescriptor> = smartTerrain.objectJobDescriptors.get(serverObject.id).job;
        const smartTask: ALifeSmartTerrainTask = job?.alifeTask as ALifeSmartTerrainTask;

        assert(
          smartTask,
          "Expected terrain task to exist when spawning in smart terrain: '%s' in '%s', job: '%s'.",
          this.object.name(),
          smartTerrain.name(),
          job?.section
        );

        this.object.set_npc_position(smartTask.position());
      }
    }

    setupObjectSmartJobsAndLogicOnSpawn(this.object, this.state, ESchemeType.MONSTER, this.isLoaded);

    return true;
  }

  public override net_destroy(): void {
    this.object.set_callback(callback.death, null);
    this.object.set_callback(callback.patrol_path_in_point, null);
    this.object.set_callback(callback.hit, null);
    this.object.set_callback(callback.sound, null);

    GlobalSoundManager.getInstance().stopSoundByObjectId(this.object.id());
    registry.actorCombat.delete(this.object.id());

    if (this.state.activeScheme !== null) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme]!, ESchemeEvent.SWITCH_OFFLINE, this.object);
    }

    const offlineObject: IStoredOfflineObject = registry.offlineObjects.get(this.object.id());

    if (offlineObject !== null) {
      offlineObject.levelVertexId = this.object.level_vertex_id();
      offlineObject.activeSection = this.state.activeSection;
    }

    unregisterObject(this.object);
    registry.objects.delete(this.object.id());

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
    if (this.state.activeSection !== null) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme!]!,
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
    logger.info("Monster death:", this.object.name());

    registry.actorCombat.delete(this.object.id());

    this.onHit(victim, 1, createEmptyVector(), killer, "from_death_callback");

    if (this.state[EScheme.MOB_DEATH]) {
      emitSchemeEvent(this.object, this.state[EScheme.MOB_DEATH], ESchemeEvent.DEATH, victim, killer);
    }

    if (this.state.activeSection) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.DEATH, victim, killer);
    }

    const hitObject: Hit = new hit();

    hitObject.draftsman = this.object;
    hitObject.type = hit.fire_wound;
    hitObject.direction = registry.actor.position().sub(this.object.position());
    hitObject.bone("pelvis");
    hitObject.power = 1;
    hitObject.impulse = 10;

    this.object.hit(hitObject);

    const objectClsId: TClassId = this.object.clsid();

    if (objectClsId === clsid.poltergeist_s) {
      logger.info("Releasing poltergeist_s:", this.object.name());

      const targetServerObject: Optional<ServerCreatureObject> = registry.simulator.object(this.object.id());

      if (targetServerObject !== null) {
        registry.simulator.release(targetServerObject, true);
      }
    }

    EventsManager.emitEvent(EGameEvent.MONSTER_KILLED, this.object, killer);
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

    EventsManager.emitEvent(
      EGameEvent.MONSTER_HIT,
      this.object,
      this.state.hit,
      ESchemeEvent.HIT,
      object,
      amount,
      direction,
      who,
      boneIndex
    );
  }

  /**
   * On monster hear sound.
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
