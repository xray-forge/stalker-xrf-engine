import {
  actor_stats,
  alife,
  callback,
  game_graph,
  ini_file,
  level,
  LuabindClass,
  object_binder,
  patrol,
  property_evaluator_const,
  stalker_ids,
  system_ini,
  time_global,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  DUMMY_LTX,
  getStoryIdByObjectId,
  IRegistryObjectState,
  loadObjectLogic,
  openLoadMarker,
  openSaveMarker,
  registerHelicopterEnemy,
  registerStalker,
  registry,
  resetObject,
  saveObjectLogic,
  unregisterHelicopterEnemy,
  unregisterStalker,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { DialogManager } from "@/engine/core/managers/interaction/dialog/DialogManager";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { TradeManager } from "@/engine/core/managers/interaction/TradeManager";
import { MapDisplayManager } from "@/engine/core/managers/interface/MapDisplayManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { DropManager } from "@/engine/core/managers/world/DropManager";
import { ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { addStateManager } from "@/engine/core/objects/state/add_state_manager";
import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/schemes/base";
import { SchemeCombat } from "@/engine/core/schemes/combat/SchemeCombat";
import { PostCombatIdle } from "@/engine/core/schemes/combat_idle/PostCombatIdle";
import { SchemeHear } from "@/engine/core/schemes/hear/SchemeHear";
import { activateMeetWithObject, updateObjectInteractionAvailability } from "@/engine/core/schemes/meet/utils";
import { SchemeReachTask } from "@/engine/core/schemes/reach_task/SchemeReachTask";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { pickSectionFromCondList, readIniString, TConditionList } from "@/engine/core/utils/ini";
import { IObjectJobDescriptor } from "@/engine/core/utils/job";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectCommunity, getObjectSquad, isUndergroundLevel } from "@/engine/core/utils/object";
import { ERelation, setClientObjectRelation, setObjectSympathy } from "@/engine/core/utils/relation";
import {
  emitSchemeEvent,
  initializeObjectInvulnerability,
  setupObjectSmartJobsAndLogicOnSpawn,
  trySwitchToAnotherSection,
} from "@/engine/core/utils/scheme";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { misc } from "@/engine/lib/constants/items/misc";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import {
  ActionPlanner,
  AnyObject,
  ClientObject,
  EClientObjectRelation,
  EScheme,
  IniFile,
  NetPacket,
  Optional,
  Reader,
  ServerCreatureObject,
  ServerHumanObject,
  TCount,
  TDuration,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TSection,
  TSoundType,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";
import { ESchemeType } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder for client side objects representing stalkers.
 * Wraps logics and adds additional layers when stalker objects are online.
 */
@LuabindClass()
export class StalkerBinder extends object_binder {
  public lastUpdatedAt: TTimestamp = 0;
  public isFirstUpdate: boolean = false;
  public isLoaded: boolean = false;

  public state!: IRegistryObjectState;
  public helicopterEnemyIndex: Optional<TIndex> = null; // todo: create binding somewhere in DB.

  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);
    this.state.stateManager = addStateManager(this.object);
    this.state.moveManager = new StalkerMoveManager(this.object).initialize();
  }

  public override net_spawn(object: ServerCreatureObject): boolean {
    const objectId: TNumberId = this.object.id();
    const actor: ClientObject = registry.actor;
    const visual: TName = readIniString(system_ini(), this.object.section(), "set_visual", false, "");

    if (visual !== null && visual !== "") {
      if (visual === "actor_visual") {
        this.object.set_visual_name(actor.get_visual_name());
      } else {
        this.object.set_visual_name(visual);
      }
    }

    if (!super.net_spawn(object)) {
      return false;
    }

    registerStalker(this);

    this.setupCallbacks();

    this.object.apply_loophole_direction_distance(1.0);

    if (!this.isLoaded) {
      const spawnIni: Optional<IniFile> = this.object.spawn_ini();

      const stalkerIniFilename: Optional<TName> =
        spawnIni === null ? null : readIniString(spawnIni, "logic", "cfg", false, "");
      let stalkerIni: Optional<IniFile> = null;

      if (stalkerIniFilename !== null) {
        stalkerIni = new ini_file(stalkerIniFilename);
      } else {
        stalkerIni = this.object.spawn_ini() || DUMMY_LTX;
      }

      this.initializeInfoPortions(stalkerIni, null);
    }

    if (!this.object.alive()) {
      this.object.death_sound_enabled(false);
      ReleaseBodyManager.getInstance().addDeadBody(this.object);

      return true;
    }

    const relation: Optional<ERelation> = registry.goodwill.relations.get(objectId);

    if (relation !== null && actor) {
      setClientObjectRelation(this.object, actor, relation);
    }

    const sympathy: Optional<TCount> = registry.goodwill.sympathy.get(objectId);

    if (sympathy !== null) {
      setObjectSympathy(this.object, sympathy);
    }

    this.helicopterEnemyIndex = registerHelicopterEnemy(this.object);

    GlobalSoundManager.initializeObjectSounds(this.object);

    // todo: Separate place.
    if (getStoryIdByObjectId(objectId) === "zat_b53_artefact_hunter_1") {
      const actionPlanner: ActionPlanner = this.object.motivation_action_manager();

      actionPlanner.remove_evaluator(stalker_ids.property_anomaly);
      actionPlanner.add_evaluator(stalker_ids.property_anomaly, new property_evaluator_const(false));
    }

    SchemeReachTask.addReachTaskSchemeAction(this.object);

    // todo: Why? Already same ref in parameter?
    const serverObject: Optional<ServerHumanObject> = alife().object(objectId);

    if (serverObject !== null) {
      if (registry.spawnedVertexes.get(serverObject.id) !== null) {
        this.object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(serverObject.id)));
        registry.spawnedVertexes.delete(serverObject.id);
      } else if (registry.offlineObjects.get(serverObject.id)?.levelVertexId !== null) {
        this.object.set_npc_position(
          level.vertex_position(registry.offlineObjects.get(serverObject.id).levelVertexId as TNumberId)
        );
      } else if (serverObject.m_smart_terrain_id !== MAX_U16) {
        const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(serverObject.m_smart_terrain_id)!;

        if (smartTerrain.arrivingObjects.get(serverObject.id) === null) {
          const jobDescriptor: IObjectJobDescriptor = smartTerrain.objectJobDescriptors.get(serverObject.id);

          this.object.set_npc_position(jobDescriptor.job!.alifeTask!.position());
        }
      }
    }

    setupObjectSmartJobsAndLogicOnSpawn(this.object, this.state, ESchemeType.STALKER, this.isLoaded);

    if (getObjectCommunity(this.object) !== communities.zombied) {
      PostCombatIdle.addPostCombatIdleWait(this.object);
    }

    this.object.group_throw_time_interval(2_000);

    return true;
  }

  public override net_destroy(): void {
    logger.info("Stalker net destroy:", this.object.name());

    const objectId: TNumberId = this.object.id();

    registry.actorCombat.delete(objectId);
    GlobalSoundManager.getInstance().stopSoundByObjectId(objectId);

    const state: IRegistryObjectState = registry.objects.get(objectId);

    if (state.activeScheme) {
      emitSchemeEvent(this.object, state[state.activeScheme]!, ESchemeEvent.NET_DESTROY, this.object);
    }

    if (this.state[EScheme.REACH_TASK]) {
      emitSchemeEvent(this.object, this.state[EScheme.REACH_TASK], ESchemeEvent.NET_DESTROY, this.object);
    }

    // Call logics on offline.
    const onOfflineConditionList: Optional<TConditionList> = state.overrides?.on_offline_condlist;

    if (onOfflineConditionList !== null) {
      pickSectionFromCondList(registry.actor, this.object, onOfflineConditionList);
    }

    if (registry.offlineObjects.get(objectId) !== null) {
      registry.offlineObjects.get(objectId).levelVertexId = this.object.level_vertex_id();
      registry.offlineObjects.get(objectId).activeSection = registry.objects.get(objectId).activeSection as TSection;
    }

    unregisterStalker(this);

    this.resetCallbacks();

    if (this.helicopterEnemyIndex !== null) {
      unregisterHelicopterEnemy(this.helicopterEnemyIndex);
    }

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (registry.actorCombat.get(this.object.id()) && this.object.best_enemy() === null) {
      registry.actorCombat.delete(this.object.id());
    }

    const object: ClientObject = this.object;
    const isObjectAlive: boolean = object.alive();

    updateStalkerLogic(object);

    if (this.isFirstUpdate === false) {
      if (isObjectAlive === false) {
        DropManager.getInstance().createCorpseReleaseItems(this.object);
      }

      this.isFirstUpdate = true;
    }

    if (time_global() - this.lastUpdatedAt > 1000) {
      this.updateLightState(object);
      this.lastUpdatedAt = time_global();
    }

    if (this.state.stateManager) {
      if (isObjectAlive) {
        this.state.stateManager.update();

        if (this.state.stateManager.isCombat === false && this.state.stateManager.isAlife === false) {
          // --and this.st.state_mgr.planner:current_action_id() == this.st.state_mgr.operators["}"]
          TradeManager.getInstance().updateForObject(object);
        }
      } else {
        this.state.stateManager = null;
      }
    }

    if (isObjectAlive) {
      GlobalSoundManager.getInstance().update(object.id());
      updateObjectInteractionAvailability(object);
      initializeObjectInvulnerability(this.object);
    }

    const squad = getObjectSquad(this.object);

    if (squad !== null) {
      if (squad.commander_id() === this.object.id()) {
        squad.update();
      }
    }

    if (!isObjectAlive) {
      object.set_tip_text_default();
    }
  }

  /**
   * todo: Description.
   */
  public updateLightState(object: ClientObject): void {
    if (object === null) {
      return;
    }

    const torch: Optional<ClientObject> = object.object(misc.device_torch);
    const isCurrentlyIndoor: boolean = isUndergroundLevel(level.name());

    if (torch === null) {
      return;
    }

    let light: boolean = false;
    let forced: boolean = false;

    /*
      if (benchmark.light) {
        light = true;
        forced = true;
      }
     */

    if (!object.alive()) {
      light = false;
      forced = true;
    }

    if (!forced) {
      for (const [, manager] of registry.lightZones) {
        [light, forced] = manager.checkStalker(object);

        if (forced === true) {
          break;
        }
      }
    }

    if (!forced) {
      const htime = level.get_time_hours();

      if (htime <= 4 || htime >= 22) {
        light = true;
      }

      if (light === false) {
        if (isCurrentlyIndoor) {
          light = true;
        }
      }
    }

    if (!forced && light === true) {
      const scheme = registry.objects.get(object.id()).activeScheme!;

      if (scheme === EScheme.CAMPER || scheme === EScheme.SLEEPER) {
        light = false;
        forced = true;
      }
    }

    if (!forced && light) {
      if (object.best_enemy() !== null && !isCurrentlyIndoor) {
        light = false;
      }
    }

    if (light !== null) {
      torch.enable_attachable_item(light);
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, StalkerBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);
    TradeManager.getInstance().saveObjectState(this.object, packet);
    GlobalSoundManager.getInstance().saveObject(packet, this.object);
    DialogManager.getInstance().saveObjectDialogs(packet, this.object);

    closeSaveMarker(packet, StalkerBinder.__name);
  }

  public override load(reader: Reader): void {
    this.isLoaded = true;

    openLoadMarker(reader, StalkerBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);
    TradeManager.getInstance().loadObjectState(reader, this.object);
    GlobalSoundManager.getInstance().loadObject(reader, this.object);
    DialogManager.getInstance().loadObjectDialogs(reader, this.object);

    closeLoadMarker(reader, StalkerBinder.__name);
  }

  public initializeInfoPortions(characterIni: IniFile, knownInfoSection: Optional<TSection>): void {
    knownInfoSection = knownInfoSection === null ? "known_info" : knownInfoSection;

    if (characterIni.section_exist(knownInfoSection)) {
      const knownInfosCount: TCount = characterIni.line_count(knownInfoSection);

      for (const it of $range(0, knownInfosCount - 1)) {
        const [result, infoPortion, value] = characterIni.r_line(knownInfoSection, it, "", "");

        this.object.give_info_portion(infoPortion);
      }
    }
  }

  /**
   * todo: Description.
   */
  public setupCallbacks(): void {
    this.object.set_patrol_extrapolate_callback(this.onPatrolExtrapolate, this);
    this.object.set_callback(callback.hit, this.onHit, this);
    this.object.set_callback(callback.death, this.onDeath, this);
    this.object.set_callback(callback.use_object, this.onUse, this);
    this.object.set_callback(callback.sound, this.onHearSound, this);
  }

  /**
   * todo: Description.
   */
  public resetCallbacks(): void {
    this.object.set_patrol_extrapolate_callback(null);
    this.object.set_callback(callback.hit, null);
    this.object.set_callback(callback.death, null);
    this.object.set_callback(callback.sound, null);
  }

  /**
   * todo: Description.
   */
  public onHearSound(
    target: ClientObject,
    whoId: TNumberId,
    soundType: TSoundType,
    soundPosition: Vector,
    soundPower: TRate
  ): void {
    if (whoId === target.id()) {
      return;
    }

    SchemeHear.onObjectHearSound(target, whoId, soundType, soundPosition, soundPower);
  }

  /**
   * todo: Description.
   */
  public onDeath(victim: ClientObject, who: Optional<ClientObject>): void {
    logger.info("Stalker death:", this.object.name());

    this.onHit(victim, 1, createEmptyVector(), who, "from_death_callback");

    registry.actorCombat.delete(this.object.id());

    const state: IRegistryObjectState = registry.objects.get(this.object.id());
    const npc: ClientObject = this.object;

    MapDisplayManager.getInstance().removeObjectMapSpot(npc, state);

    const knownInfo: Optional<TName> = readIniString(state.ini!, state.sectionLogic, "known_info", false, "", null);

    this.initializeInfoPortions(state.ini!, knownInfo);

    if (this.state.stateManager !== null) {
      this.state.stateManager!.animation.setState(null, true);
    }

    if (this.state[EScheme.REACH_TASK]) {
      emitSchemeEvent(this.object, this.state[EScheme.REACH_TASK], ESchemeEvent.DEATH, victim, who);
    }

    if (this.state[EScheme.DEATH]) {
      emitSchemeEvent(this.object, this.state[EScheme.DEATH], ESchemeEvent.DEATH, victim, who);
    }

    if (this.state.activeSection) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.DEATH, victim, who);
    }

    this.updateLightState(this.object);
    DropManager.getInstance().createCorpseReleaseItems(this.object);

    unregisterHelicopterEnemy(this.helicopterEnemyIndex!);
    unregisterStalker(this, false);

    this.resetCallbacks();

    if (actor_stats.remove_from_ranking !== null) {
      const community: TCommunity = getObjectCommunity(this.object);

      if (community === communities.zombied || community === communities.monolith) {
        // placeholder
      } else {
        actor_stats.remove_from_ranking(this.object.id());
      }
    }

    EventsManager.emitEvent(EGameEvent.STALKER_KILLED, this.object, who);
    ReleaseBodyManager.getInstance().addDeadBody(this.object);
  }

  /**
   * todo: Description.
   */
  public onUse(object: ClientObject, who: ClientObject): void {
    logger.info("Stalker use:", this.object.name(), "by", who.name());

    if (this.object.alive()) {
      EventsManager.emitEvent(EGameEvent.STALKER_INTERACTION, object, who);
      DialogManager.getInstance().resetForObject(this.object);
      activateMeetWithObject(object);

      if (this.state.activeSection) {
        emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.USE, object, who);
      }
    }
  }

  /**
   * todo: Description.
   */
  public onPatrolExtrapolate(currentPoint: TNumberId): boolean {
    if (this.state.activeSection) {
      emitSchemeEvent(this.object, this.state[this.state.activeScheme!]!, ESchemeEvent.EXTRAPOLATE);
      this.state.moveManager!.onExtrapolate(this.object);
    }

    return new patrol(this.object.patrol()!).flags(currentPoint).get() === 0;
  }

  /**
   * todo: Description.
   */
  public onHit(
    object: ClientObject,
    amount: TRate,
    direction: Vector,
    who: Optional<ClientObject>,
    boneIndex: string | number
  ): void {
    const actor: ClientObject = registry.actor;

    // -- FIXME: �������� ������� ���� �� �������������� � ����� storage, � �� ��������...
    if (who?.id() === ACTOR_ID) {
      if (amount > 0) {
        for (const [, descriptor] of SimulationBoardManager.getInstance().getSmartTerrainDescriptors()) {
          const smartTerrain: SmartTerrain = descriptor.smartTerrain;

          if (smartTerrain.smartTerrainActorControl !== null) {
            const levelId: TNumberId = game_graph().vertex(smartTerrain.m_game_vertex_id).level_id();
            const actorLevelId: TNumberId = game_graph().vertex(alife().actor().m_game_vertex_id).level_id();

            if (levelId === actorLevelId && actor.position().distance_to_sqr(smartTerrain.position) <= 6400) {
              if (this.object.relation(actor) !== EClientObjectRelation.ENEMY) {
                smartTerrain.smartTerrainActorControl.onActorAttackSmartTerrain();
              }
            }
          }
        }
      }
    }

    if (this.state.activeSection) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.activeScheme!]!,
        ESchemeEvent.HIT,
        object,
        amount,
        direction,
        who,
        boneIndex
      );
    }

    // Probably should be reversed?
    if (this.state.combat_ignore) {
      emitSchemeEvent(
        this.object,
        this.state.combat_ignore,
        ESchemeEvent.HIT,
        object,
        amount,
        direction,
        who,
        boneIndex
      );
    }

    if (this.state.combat) {
      emitSchemeEvent(this.object, this.state.combat, ESchemeEvent.HIT, object, amount, direction, who, boneIndex);
    }

    if (this.state.hit) {
      emitSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, object, amount, direction, who, boneIndex);
    }

    if (boneIndex !== 15 && amount > this.object.health * 100) {
      this.object.health = 0.15;
    }

    if (amount > 0) {
      (this.state[EScheme.WOUNDED] as ISchemeWoundedState)?.woundManager.onHit();
    }

    EventsManager.emitEvent(EGameEvent.STALKER_HIT, this.object, amount, direction, who, boneIndex);
  }
}

/**
 * todo: Description.
 */
export function updateStalkerLogic(object: ClientObject): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());
  const actor: ClientObject = registry.actor;
  const combatState: IBaseSchemeState = state.combat!;

  if (state !== null && state.activeScheme !== null && object.alive()) {
    let switched: boolean = false;
    const manager: ActionPlanner = object.motivation_action_manager();

    if (manager.initialized() && manager.current_action_id() === stalker_ids.action_combat_planner) {
      const overrides: Optional<AnyObject> = state.overrides;

      if (overrides !== null) {
        if (overrides["on_combat"]) {
          pickSectionFromCondList(actor, object, overrides["on_combat"].condlist);
        }

        if (combatState && combatState.logic) {
          if (!trySwitchToAnotherSection(object, combatState)) {
            if (overrides["combat_type"]) {
              SchemeCombat.setCombatType(object, actor, overrides);
            }
          } else {
            switched = true;
          }
        }
      } else {
        SchemeCombat.setCombatType(object, actor, combatState);
      }
    }

    if (!switched) {
      trySwitchToAnotherSection(object, state[state.activeScheme as EScheme] as IBaseSchemeState);
    }
  } else {
    SchemeCombat.setCombatType(object, actor, combatState);
  }
}
