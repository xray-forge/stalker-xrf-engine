import {
  actor_stats,
  alife,
  callback,
  game_graph,
  game_object,
  ini_file,
  level,
  LuabindClass,
  object_binder,
  patrol,
  property_evaluator_const,
  stalker_ids,
  system_ini,
  time_global,
  TXR_snd_type,
  vector,
  XR_action_planner,
  XR_CALifeSmartTerrainTask,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_human_abstract,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
  XR_vector,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  DUMMY_LTX,
  getStoryIdByObjectId,
  IRegistryObjectState,
  openSaveMarker,
  registerHelicopterEnemy,
  registerObject,
  registry,
  resetObject,
  unregisterHelicopterEnemy,
  unregisterObject,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { DialogManager } from "@/engine/core/managers/interaction/DialogManager";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { TradeManager } from "@/engine/core/managers/interaction/TradeManager";
import { MapDisplayManager } from "@/engine/core/managers/interface/MapDisplayManager";
import { StatisticsManager } from "@/engine/core/managers/interface/StatisticsManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { DropManager } from "@/engine/core/managers/world/DropManager";
import { ReleaseBodyManager } from "@/engine/core/managers/world/ReleaseBodyManager";
import { setupSmartJobsAndLogicOnSpawn, SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { addStateManager } from "@/engine/core/objects/state/add_state_manager";
import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { ESchemeEvent } from "@/engine/core/schemes";
import {
  emitSchemeEvent,
  getObjectGenericSchemeOverrides,
  trySwitchToAnotherSection,
} from "@/engine/core/schemes/base/utils";
import { SchemeCombat } from "@/engine/core/schemes/combat/SchemeCombat";
import { PostCombatIdle } from "@/engine/core/schemes/danger/PostCombatIdle";
import { SchemeDanger } from "@/engine/core/schemes/danger/SchemeDanger";
import { ActionSchemeHear } from "@/engine/core/schemes/hear/ActionSchemeHear";
import { SchemeMeet } from "@/engine/core/schemes/meet/SchemeMeet";
import { SchemeReachTask } from "@/engine/core/schemes/reach_task/SchemeReachTask";
import { SchemeLight } from "@/engine/core/schemes/sr_light/SchemeLight";
import { SchemeWounded } from "@/engine/core/schemes/wounded/SchemeWounded";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity, getObjectSquad, updateObjectInvulnerability } from "@/engine/core/utils/object";
import { TConditionList } from "@/engine/core/utils/parse";
import { setObjectsRelation, setObjectSympathy } from "@/engine/core/utils/relation";
import { communities } from "@/engine/lib/constants/communities";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TRelation } from "@/engine/lib/constants/relations";
import {
  EScheme,
  Optional,
  TCount,
  TDuration,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";
import { ESchemeType } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class StalkerBinder extends object_binder {
  public lastUpdatedAt: TTimestamp = 0;
  public isFirstUpdate: boolean = false;
  public isLoaded: boolean = false;

  public state!: IRegistryObjectState;
  public helicopterEnemyIndex: Optional<TIndex> = null; // todo: create binding somewhere in DB.

  /**
   * todo: Description.
   */
  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);
    this.state.stateManager = addStateManager(this.object);
    this.state.moveManager = new StalkerMoveManager(this.object).initialize();
  }

  /**
   * todo: Description.
   */
  public extrapolate_callback(currentPoint: TNumberId): boolean {
    if (this.state.active_section) {
      emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.EXTRAPOLATE);
      this.state.moveManager!.extrapolate_callback(this.object);
    }

    return new patrol(this.object.patrol()!).flags(currentPoint).get() === 0;
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_creature_abstract): boolean {
    const objectId: TNumberId = this.object.id();
    const actor: XR_game_object = registry.actor;
    const visual: TName = readIniString(system_ini(), this.object.section(), "set_visual", false, "");

    logger.info("Stalker net spawn:", objectId, this.object.name());

    if (visual !== null && visual !== "") {
      if (visual === "actor_visual") {
        this.object.set_visual_name(actor.get_visual_name());
      } else {
        this.object.set_visual_name(visual);
      }
    }

    registerStalker(objectId); // todo: Probably register with object?

    if (!super.net_spawn(object)) {
      return false;
    }

    registerObject(this.object);

    this.setupCallbacks();

    this.object.apply_loophole_direction_distance(1.0);

    if (!this.isLoaded) {
      const spawnIni: Optional<XR_ini_file> = this.object.spawn_ini();

      const stalkerIniFilename: Optional<TName> =
        spawnIni === null ? null : readIniString(spawnIni, "logic", "cfg", false, "");
      let stalkerIni: Optional<XR_ini_file> = null;

      if (stalkerIniFilename !== null) {
        stalkerIni = new ini_file(stalkerIniFilename);
      } else {
        stalkerIni = this.object.spawn_ini() || DUMMY_LTX;
      }

      loadInfo(this.object, stalkerIni, null);
    }

    if (!this.object.alive()) {
      this.object.death_sound_enabled(false);
      ReleaseBodyManager.getInstance().addDeadBody(this.object);

      return true;
    }

    const relation: Optional<TRelation> = registry.goodwill.relations.get(objectId);

    if (relation !== null && actor) {
      setObjectsRelation(this.object, actor, relation);
    }

    const sympathy: Optional<TCount> = registry.goodwill.sympathy.get(objectId);

    if (sympathy !== null) {
      setObjectSympathy(this.object, sympathy);
    }

    registerHelicopterEnemy(this.object);
    this.helicopterEnemyIndex = registry.helicopter.enemiesCount - 1;

    GlobalSoundManager.initializeObjectSounds(this.object);

    // todo: Separate place.
    if (getStoryIdByObjectId(objectId) === "zat_b53_artefact_hunter_1") {
      const actionPlanner: XR_action_planner = this.object.motivation_action_manager();

      actionPlanner.remove_evaluator(stalker_ids.property_anomaly);
      actionPlanner.add_evaluator(stalker_ids.property_anomaly, new property_evaluator_const(false));
    }

    SchemeReachTask.addReachTaskSchemeAction(this.object);

    // todo: Why? Already same ref in parameter?
    const serverObject: Optional<XR_cse_alife_human_abstract> = alife().object(objectId);

    if (serverObject !== null) {
      if (registry.spawnedVertexes.get(serverObject.id) !== null) {
        this.object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(serverObject.id)));
        registry.spawnedVertexes.delete(serverObject.id);
      } else if (registry.offlineObjects.get(serverObject.id)?.level_vertex_id !== null) {
        this.object.set_npc_position(
          level.vertex_position(registry.offlineObjects.get(serverObject.id).level_vertex_id as TNumberId)
        );
      } else if (serverObject.m_smart_terrain_id !== MAX_U16) {
        const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(serverObject.m_smart_terrain_id)!;

        if (smartTerrain.arrivingObjects.get(serverObject.id) === null) {
          const smartName = smartTerrain.name();
          const jobDatas = smartTerrain.objectJobDescriptors;
          const arriving = smartTerrain.arrivingObjects;
          const jobData = smartTerrain.objectJobDescriptors.get(serverObject.id);
          const smartTask: XR_CALifeSmartTerrainTask = smartTerrain.jobsData.get(jobData?.job_id).alife_task;

          this.object.set_npc_position(smartTask.position());
        }
      }
    }

    setupSmartJobsAndLogicOnSpawn(this.object, this.state, object, ESchemeType.STALKER, this.isLoaded);

    if (getCharacterCommunity(this.object) !== communities.zombied) {
      PostCombatIdle.addPostCombatIdleWait(this.object);
    }

    this.object.group_throw_time_interval(2_000);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    logger.info("Stalker net destroy:", this.object.name());

    const objectId: TNumberId = this.object.id();

    registry.actorCombat.delete(objectId);
    GlobalSoundManager.getInstance().stopSoundByObjectId(objectId);

    const state: IRegistryObjectState = registry.objects.get(objectId);

    if (state.active_scheme) {
      emitSchemeEvent(this.object, state[state.active_scheme]!, ESchemeEvent.NET_DESTROY, this.object);
    }

    if (this.state[EScheme.REACH_TASK]) {
      emitSchemeEvent(this.object, this.state[EScheme.REACH_TASK], ESchemeEvent.NET_DESTROY, this.object);
    }

    const on_offline_condlist: Optional<TConditionList> = state.overrides?.on_offline_condlist;

    if (on_offline_condlist !== null) {
      pickSectionFromCondList(registry.actor, this.object, on_offline_condlist);
    }

    if (registry.offlineObjects.get(objectId) !== null) {
      registry.offlineObjects.get(objectId).level_vertex_id = this.object.level_vertex_id();
      registry.offlineObjects.get(objectId).active_section = registry.objects.get(objectId).active_section as TSection;
    }

    unregisterObject(this.object);
    unregisterStalker(objectId);

    this.resetCallbacks();

    if (this.helicopterEnemyIndex !== null) {
      unregisterHelicopterEnemy(this.helicopterEnemyIndex);
    }

    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public setupCallbacks(): void {
    this.object.set_patrol_extrapolate_callback(this.extrapolate_callback, this);
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
  public onHit(
    object: XR_game_object,
    amount: TRate,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    boneIndex: string | number
  ): void {
    const actor: XR_game_object = registry.actor;

    // -- FIXME: �������� ������� ���� �� �������������� � ����� storage, � �� ��������...
    if (who?.id() === actor.id()) {
      StatisticsManager.getInstance().updateBestWeapon(amount);
      if (amount > 0) {
        for (const [, descriptor] of SimulationBoardManager.getInstance().getSmartTerrainDescriptors()) {
          const smartTerrain: SmartTerrain = descriptor.smartTerrain;

          if (smartTerrain.smartTerrainActorControl !== null) {
            const levelId: TNumberId = game_graph().vertex(smartTerrain.m_game_vertex_id).level_id();
            const actorLevelId: TNumberId = game_graph().vertex(alife().actor().m_game_vertex_id).level_id();

            if (levelId === actorLevelId && actor.position().distance_to_sqr(smartTerrain.position) <= 6400) {
              if (this.object.relation(actor) !== game_object.enemy) {
                smartTerrain.smartTerrainActorControl.actor_attack();
              }
            }
          }
        }
      }
    }

    if (this.state.active_section) {
      emitSchemeEvent(
        this.object,
        this.state[this.state.active_scheme!]!,
        ESchemeEvent.HIT,
        object,
        amount,
        local_direction,
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
        local_direction,
        who,
        boneIndex
      );
    }

    if (this.state.combat) {
      emitSchemeEvent(
        this.object,
        this.state.combat,
        ESchemeEvent.HIT,
        object,
        amount,
        local_direction,
        who,
        boneIndex
      );
    }

    if (this.state.hit) {
      emitSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, object, amount, local_direction, who, boneIndex);
    }

    if (boneIndex !== 15 && amount > this.object.health * 100) {
      this.object.health = 0.15;
    }

    if (amount > 0) {
      SchemeWounded.hit_callback(object.id());
    }
  }

  /**
   * todo: Description.
   */
  public onDeath(victim: XR_game_object, who: Optional<XR_game_object>): void {
    logger.info("Stalker death:", this.object.name());

    this.onHit(victim, 1, new vector().set(0, 0, 0), who, "from_death_callback");

    registry.actorCombat.delete(this.object.id());

    const state = registry.objects.get(this.object.id());
    const npc = this.object;
    const actor = registry.actor;

    MapDisplayManager.getInstance().removeObjectMapSpot(npc, state);

    if (who?.id() === actor.id()) {
      const statisticsManager: StatisticsManager = StatisticsManager.getInstance();

      // -- todo: Probably only for stalkers so should be called only for increment.
      statisticsManager.incrementKilledStalkersCount();
      statisticsManager.updateBestMonsterKilled(npc);
    }

    const known_info = readIniString(state.ini!, state.section_logic, "known_info", false, "", null);

    loadInfo(this.object, state.ini!, known_info);

    if (this.state.stateManager !== null) {
      this.state.stateManager!.animation.setState(null, true);
    }

    if (this.state[EScheme.REACH_TASK]) {
      emitSchemeEvent(this.object, this.state[EScheme.REACH_TASK], ESchemeEvent.DEATH, victim, who);
    }

    if (this.state[EScheme.DEATH]) {
      emitSchemeEvent(this.object, this.state[EScheme.DEATH], ESchemeEvent.DEATH, victim, who);
    }

    if (this.state.active_section) {
      emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.DEATH, victim, who);
    }

    SchemeLight.checkObjectLight(this.object);
    DropManager.getInstance().createCorpseReleaseItems(this.object);

    unregisterHelicopterEnemy(this.helicopterEnemyIndex!);
    unregisterStalker(this.object.id());

    this.resetCallbacks();

    if (actor_stats.remove_from_ranking !== null) {
      const community = getCharacterCommunity(this.object);

      if (community === communities.zombied || community === communities.monolith) {
        // placeholder
      } else {
        actor_stats.remove_from_ranking(this.object.id());
      }
    }

    ReleaseBodyManager.getInstance().addDeadBody(this.object);
  }

  /**
   * todo: Description.
   */
  public onUse(object: XR_game_object, who: XR_game_object): void {
    logger.info("Stalker use:", this.object.name(), "by", who.name());

    if (this.object.alive()) {
      EventsManager.getInstance().emitEvent(EGameEvent.NPC_INTERACTION, object, who);
      DialogManager.getInstance().resetForObject(this.object);
      SchemeMeet.onMeetWithObject(object);

      if (this.state.active_section) {
        emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.USE, object, who);
      }
    }
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    super.update(delta);

    if (registry.actorCombat.get(this.object.id()) && this.object.best_enemy() === null) {
      registry.actorCombat.delete(this.object.id());
    }

    const object: XR_game_object = this.object;
    const isObjectAlive: boolean = object.alive();

    update_logic(object);

    if (this.isFirstUpdate === false) {
      if (isObjectAlive === false) {
        DropManager.getInstance().createCorpseReleaseItems(this.object);
      }

      this.isFirstUpdate = true;
    }

    if (time_global() - this.lastUpdatedAt > 1000) {
      SchemeLight.checkObjectLight(object);
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
      SchemeMeet.updateObjectInteractionAvailability(object);
      updateObjectInvulnerability(this.object);
    }

    const squad = getObjectSquad(this.object);

    if (squad !== null) {
      if (squad.commander_id() === this.object.id()) {
        squad.update();
      }
    }

    object.info_clear();

    if (isObjectAlive) {
      const active_section = registry.objects.get(object.id()).active_section;

      if (active_section) {
        object.info_add("section: " + active_section);
      }

      const best_enemy = object.best_enemy();

      if (best_enemy) {
        object.info_add("enemy: " + best_enemy.name());
      }

      const best_danger = object.best_danger();

      if (best_danger) {
        object.info_add("danger: " + SchemeDanger.get_danger_name(best_danger));
      }

      object.info_add(object.name() + " [" + object.team() + "][" + object.squad() + "][" + object.group() + "]");

      if (alife().object(object.id()) === null) {
        return;
      }

      if (squad !== null) {
        object.info_add("squad_id: " + squad.section_name());
        if (squad.currentAction !== null) {
          const target =
            squad.assignedTargetId &&
            alife().object(squad.assignedTargetId) &&
            alife().object(squad.assignedTargetId)!.name();

          this.object.info_add("current_action: " + squad.currentAction.name + "[" + tostring(target) + "]");
        }
      }
    } else {
      object.set_tip_text_default();
    }
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
    openSaveMarker(packet, StalkerBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);
    TradeManager.getInstance().saveObjectState(this.object, packet);
    GlobalSoundManager.getInstance().saveObject(packet, this.object);
    DialogManager.getInstance().saveObjectDialogs(packet, this.object);

    closeSaveMarker(packet, StalkerBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    this.isLoaded = true;

    openLoadMarker(reader, StalkerBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);
    TradeManager.getInstance().loadObjectState(reader, this.object);
    GlobalSoundManager.getInstance().loadObject(reader, this.object);
    DialogManager.getInstance().loadObjectDialogs(reader, this.object);

    closeLoadMarker(reader, StalkerBinder.__name);
  }

  /**
   * todo: Description.
   */
  public onHearSound(
    target: XR_game_object,
    who_id: TNumberId,
    sound_type: TXR_snd_type,
    sound_position: XR_vector,
    sound_power: TRate
  ): void {
    if (who_id === target.id()) {
      return;
    }

    ActionSchemeHear.onObjectHearSound(target, who_id, sound_type, sound_position, sound_power);
  }
}

/**
 * todo: Description.
 */
export function update_logic(object: XR_game_object): void {
  const object_alive = object.alive();
  const st = registry.objects.get(object.id());
  const actor = registry.actor;
  const st_combat = st.combat!;

  if (st !== null && st.active_scheme !== null && object_alive) {
    let switched = false;
    const manager = object.motivation_action_manager();

    if (manager.initialized() && manager.current_action_id() === stalker_ids.action_combat_planner) {
      const overrides = getObjectGenericSchemeOverrides(object);

      if (overrides !== null) {
        if (overrides.get("on_combat")) {
          pickSectionFromCondList(actor, object, overrides.get("on_combat").condlist);
        }

        if (st_combat && (st_combat as any).logic) {
          if (!trySwitchToAnotherSection(object, st_combat, actor)) {
            if (overrides.get("combat_type")) {
              SchemeCombat.setCombatType(object, actor, overrides);
            }
          } else {
            switched = true;
          }
        }
      } else {
        SchemeCombat.setCombatType(object, actor, st_combat);
      }
    }

    if (!switched) {
      trySwitchToAnotherSection(object, st[st.active_scheme!]!, actor);
    }
  } else {
    SchemeCombat.setCombatType(object, actor, st_combat);
  }
}

/**
 * todo: Description.
 */
function loadInfo(object: XR_game_object, characterIni: XR_ini_file, knownInfoSection: Optional<TSection>): void {
  knownInfoSection = knownInfoSection === null ? "known_info" : knownInfoSection;

  if (characterIni.section_exist(knownInfoSection)) {
    const knownInfosCount: TCount = characterIni.line_count(knownInfoSection);

    for (const it of $range(0, knownInfosCount - 1)) {
      const [result, infoPortion, value] = characterIni.r_line(knownInfoSection, it, "", "");

      object.give_info_portion(infoPortion);
    }
  }
}
