import { alife, callback, clsid, cond, hit, level, LuabindClass, move, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  IStoredOfflineObject,
  openSaveMarker,
  registerObject,
  registry,
  resetObject,
  unregisterObject,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { StatisticsManager } from "@/engine/core/managers/interface/StatisticsManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { setupSmartJobsAndLogicOnSpawn } from "@/engine/core/objects/server/smart_terrain/jobs_general";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { SquadReachTargetAction } from "@/engine/core/objects/server/squad/action";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { TSimulationObject } from "@/engine/core/objects/server/types";
import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/schemes";
import { SchemeHear } from "@/engine/core/schemes/hear/SchemeHear";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { TConditionList } from "@/engine/core/utils/ini/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  action,
  getObjectSquad,
  isObjectScriptCaptured,
  scriptCaptureObject,
  scriptReleaseObject,
} from "@/engine/core/utils/object/object_general";
import { emitSchemeEvent } from "@/engine/core/utils/scheme/logic";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import {
  ALifeSmartTerrainTask,
  ClientObject,
  EScheme,
  ESchemeType,
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

    if (alife().object(this.object.id()) === null) {
      return;
    }

    if (this.object.get_enemy()) {
      if (isObjectScriptCaptured(this.object)) {
        scriptReleaseObject(this.object, MonsterBinder.__name);
      }

      return;
    }

    if (squad?.currentAction?.name === SquadReachTargetAction.ACTION_NAME) {
      const currentTarget: Optional<TSimulationObject> = registry.simulationObjects.get(squad.assignedTargetId!);

      if (currentTarget === null) {
        return;
      }

      const [targetPosition] = currentTarget.getGameLocation();

      scriptCaptureObject(this.object, true, MonsterBinder.__name);

      if (squad.commander_id() === this.object.id()) {
        action(this.object, new move(move.walk_with_leader, targetPosition), new cond(cond.move_end));
      } else {
        const commanderPosition: Vector = alife().object(squad.commander_id())!.position;

        if (commanderPosition.distance_to_sqr(this.object.position()) > 100) {
          action(this.object, new move(move.run_with_leader, targetPosition), new cond(cond.move_end));
        } else {
          action(this.object, new move(move.walk_with_leader, targetPosition), new cond(cond.move_end));
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
    const onOfflineConditionsList: Optional<TConditionList> =
      state !== null && state.overrides && state.overrides.on_offline_condlist;

    if (onOfflineConditionsList !== null) {
      pickSectionFromCondList(registry.actor, this.object, onOfflineConditionsList as any);
    }

    if (!this.object.alive()) {
      return true;
    }

    // todo: Is it possible?
    if (alife().object(this.object.id()) === null) {
      return false;
    }

    registerObject(this.object);

    // todo: Just use parameter?
    const serverObject: ServerCreatureObject = alife().object(this.object.id())!;

    if (registry.spawnedVertexes.has(serverObject.id)) {
      this.object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(serverObject.id)));
      registry.spawnedVertexes.delete(serverObject.id);
    } else if (registry.offlineObjects.get(serverObject.id)?.levelVertexId !== null) {
      this.object.set_npc_position(
        level.vertex_position(registry.offlineObjects.get(serverObject.id).levelVertexId as TNumberId)
      );
    } else if (serverObject.m_smart_terrain_id !== MAX_U16) {
      const smartTerrain: Optional<SmartTerrain> = alife().object<SmartTerrain>(serverObject.m_smart_terrain_id);

      if (smartTerrain !== null && smartTerrain.arrivingObjects.get(serverObject.id) === null) {
        const smartTask: ALifeSmartTerrainTask = smartTerrain.jobsData.get(
          smartTerrain.objectJobDescriptors.get(serverObject.id).job_id
        ).alife_task;

        this.object.set_npc_position(smartTask.position());
      }
    }

    setupSmartJobsAndLogicOnSpawn(this.object, this.state, object, ESchemeType.MONSTER, this.isLoaded);

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
      emitSchemeEvent(this.object, this.state[this.state.activeScheme]!, ESchemeEvent.NET_DESTROY);
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
  public onWaypoint(object: ClientObject, actionType: number, index: TIndex): void {
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
  public onDeath(victim: ClientObject, killer: ClientObject): void {
    logger.info("Monster death:", this.object.name());

    registry.actorCombat.delete(this.object.id());

    this.onHit(victim, 1, createEmptyVector(), killer, "from_death_callback");

    if (killer.id() === registry.actor.id()) {
      const statisticsManager: StatisticsManager = StatisticsManager.getInstance();

      statisticsManager.incrementKilledMonstersCount();
      statisticsManager.updateBestMonsterKilled(this.object);
    }

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

      const targetServerObject: Optional<ServerCreatureObject> = alife().object(this.object.id());

      if (targetServerObject !== null) {
        alife().release(targetServerObject, true);
      }
    }
  }

  /**
   * On monster hit by another object.
   */
  public onHit(
    object: ClientObject,
    amount: TCount,
    direction: Vector,
    who: ClientObject,
    boneIndex: TLabel | TIndex
  ): void {
    if (who.id() === registry.actor.id()) {
      StatisticsManager.getInstance().updateBestWeapon(amount);
    }

    if (this.state[EScheme.HIT]) {
      emitSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, object, amount, direction, who, boneIndex);
    }
  }

  /**
   * On monster hear sound.
   */
  public onHearSound(
    object: ClientObject,
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
