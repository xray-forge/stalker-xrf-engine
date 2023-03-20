import {
  alife,
  callback,
  clsid,
  cond,
  hit,
  level,
  LuabindClass,
  move,
  object_binder,
  patrol,
  TXR_class_id,
  TXR_snd_type,
  vector,
  XR_CALifeSmartTerrainTask,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_hit,
  XR_net_packet,
  XR_reader,
  XR_vector,
} from "xray16";

import { IRegistryObjectState, registerObject, registry, resetObject, unregisterObject } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { StatisticsManager } from "@/engine/core/managers/StatisticsManager";
import { setupSmartJobsAndLogicOnSpawn, SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/engine/core/objects/alife/Squad";
import { ESchemeEvent } from "@/engine/core/schemes/base";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ActionSchemeHear } from "@/engine/core/schemes/hear/ActionSchemeHear";
import { issueSchemeEvent } from "@/engine/core/schemes/issueSchemeEvent";
import { mobCapture } from "@/engine/core/schemes/mobCapture";
import { mobCaptured } from "@/engine/core/schemes/mobCaptured";
import { mobRelease } from "@/engine/core/schemes/mobRelease";
import { loadObject, saveObject } from "@/engine/core/schemes/storing";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { action, getObjectSquad } from "@/engine/core/utils/object";
import { TConditionList } from "@/engine/core/utils/parse";
import { MAX_UNSIGNED_16_BIT } from "@/engine/lib/constants/memory";
import {
  EScheme,
  ESchemeType,
  Optional,
  TCount,
  TDuration,
  TIndex,
  TLabel,
  TNumberId,
  TRate,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class MonsterBinder extends object_binder {
  public isLoaded: boolean = false;

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
  public override reload(section: TSection): void {
    super.reload(section);
  }

  /**
   * todo: Description.
   */
  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);

    this.object.set_callback(callback.patrol_path_in_point, this.waypoint_callback, this);
    this.object.set_callback(callback.hit, this.hit_callback, this);
    this.object.set_callback(callback.death, this.death_callback, this);
    this.object.set_callback(callback.sound, this.hear_callback, this);
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    super.update(delta);

    if (registry.actorCombat.get(this.object.id()) && this.object.best_enemy() === null) {
      registry.actorCombat.delete(this.object.id());
    }

    const squad: Optional<Squad> = getObjectSquad(this.object);
    const object_alive: boolean = this.object.alive();

    if (!object_alive) {
      return;
    }

    this.object.set_tip_text("");

    if (this.state.active_scheme !== null) {
      trySwitchToAnotherSection(this.object, this.state[this.state.active_scheme!]!, registry.actor);
    }

    if (squad !== null && squad.commander_id() === this.object.id()) {
      squad.update();
    }

    this.object.info_clear();

    const active_section = this.state.active_section;

    if (active_section !== null) {
      this.object.info_add("section: " + active_section);
    }

    const best_enemy = this.object.best_enemy();

    if (best_enemy) {
      this.object.info_add("enemy: " + best_enemy.name());
    }

    this.object.info_add(
      this.object.name() + " [" + this.object.team() + "][" + this.object.squad() + "][" + this.object.group() + "]"
    );

    if (alife().object(this.object.id()) === null) {
      return;
    }

    if (squad !== null) {
      this.object.info_add("squad_id: " + squad.section_name());

      if (squad.current_action !== null) {
        const target =
          squad.assigned_target_id &&
          alife().object(squad.assigned_target_id) &&
          alife().object(squad.assigned_target_id)!.name();

        this.object.info_add("current_action: " + squad.current_action.name + "[" + tostring(target) + "]");
      }
    }

    if (this.object.get_enemy()) {
      if (mobCaptured(this.object)) {
        mobRelease(this.object, MonsterBinder.__name);
      }

      return;
    }

    if (squad && squad.current_action && squad.current_action.name === "reach_target") {
      const squad_target = registry.simulationObjects.get(squad.assigned_target_id!);

      if (squad_target === null) {
        return;
      }

      const [target_pos] = squad_target.get_location();

      mobCapture(this.object, true, MonsterBinder.__name);

      if (squad.commander_id() === this.object.id()) {
        action(this.object, new move(move.walk_with_leader, target_pos), new cond(cond.move_end));
      } else {
        const commander_pos = alife().object(squad.commander_id())!.position;

        if (commander_pos.distance_to(this.object.position()) > 10) {
          action(this.object, new move(move.run_with_leader, target_pos), new cond(cond.move_end));
        } else {
          action(this.object, new move(move.walk_with_leader, target_pos), new cond(cond.move_end));
        }
      }

      return;
    }

    if (this.state.active_section !== null) {
      issueSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.UPDATE, delta);
    }
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, MonsterBinder.__name);

    super.save(packet);
    saveObject(this.object, packet);

    setSaveMarker(packet, true, MonsterBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    this.isLoaded = true;

    setLoadMarker(reader, false, MonsterBinder.__name);
    super.load(reader);
    loadObject(this.object, reader);

    setLoadMarker(reader, true, MonsterBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_creature_abstract): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Net spawn:", object.name());

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
    const serverObject: XR_cse_alife_creature_abstract = alife().object<XR_cse_alife_creature_abstract>(
      this.object.id()
    )!;

    if (registry.spawnedVertexes.has(serverObject.id)) {
      this.object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(serverObject.id)));
      registry.spawnedVertexes.delete(serverObject.id);
    } else if (registry.offlineObjects.get(serverObject.id)?.level_vertex_id !== null) {
      this.object.set_npc_position(
        level.vertex_position(registry.offlineObjects.get(serverObject.id).level_vertex_id as TNumberId)
      );
    } else if (serverObject.m_smart_terrain_id !== MAX_UNSIGNED_16_BIT) {
      const smartTerrain: Optional<SmartTerrain> = alife().object<SmartTerrain>(serverObject.m_smart_terrain_id);

      if (smartTerrain !== null && smartTerrain.arrivingObjects.get(serverObject.id) === null) {
        const smartTask: XR_CALifeSmartTerrainTask = smartTerrain.jobsData.get(
          smartTerrain.objectJobDescriptors.get(serverObject.id).job_id
        ).alife_task;

        this.object.set_npc_position(smartTask.position());
      }
    }

    setupSmartJobsAndLogicOnSpawn(this.object, this.state, object, ESchemeType.MONSTER, this.isLoaded);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    this.object.set_callback(callback.death, null);
    this.object.set_callback(callback.patrol_path_in_point, null);
    this.object.set_callback(callback.hit, null);
    this.object.set_callback(callback.sound, null);

    GlobalSoundManager.getInstance().stopSoundsByObjectId(this.object.id());
    registry.actorCombat.delete(this.object.id());

    if (this.state.active_scheme !== null) {
      issueSchemeEvent(this.object, this.state[this.state.active_scheme]!, ESchemeEvent.NET_DESTROY);
    }

    const offlineObject = registry.offlineObjects.get(this.object.id());

    if (offlineObject !== null) {
      offlineObject.level_vertex_id = this.object.level_vertex_id();
      offlineObject.active_section = this.state.active_section;
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
  public extrapolate_callback(): Optional<boolean> {
    if (registry.objects.get(this.object.id()) === null || registry.objects.get(this.object.id()).object === null) {
      return null;
    }

    if (this.object.get_script() === false) {
      return false;
    }

    const cur_pt = this.object.get_current_point_index();
    const patrol_path = this.object.patrol()!;

    if (!level.patrol_path_exists(patrol_path)) {
      return false;
    }

    if (new patrol(patrol_path).flags(cur_pt).get() === 0) {
      return true;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public waypoint_callback(object: XR_game_object, action_type: number, index: TIndex): void {
    if (this.state.active_section !== null) {
      issueSchemeEvent(
        this.object,
        this.state[this.state.active_scheme!]!,
        ESchemeEvent.WAYPOINT,
        object,
        action_type,
        index
      );
    }
  }

  /**
   * todo: Description.
   */
  public death_callback(victim: XR_game_object, killer: XR_game_object): void {
    registry.actorCombat.delete(this.object.id());

    this.hit_callback(victim, 1, new vector().set(0, 0, 0), killer, "from_death_callback");

    if (killer.id() === registry.actor.id()) {
      const statisticsManager: StatisticsManager = StatisticsManager.getInstance();

      statisticsManager.incrementKilledMonstersCount();
      statisticsManager.updateBestMonsterKilled(this.object);
    }

    if (this.state[EScheme.MOB_DEATH]) {
      issueSchemeEvent(this.object, this.state[EScheme.MOB_DEATH], ESchemeEvent.DEATH, victim, killer);
    }

    if (this.state.active_section) {
      issueSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.DEATH, victim, killer);
    }

    const hitObject: XR_hit = new hit();

    hitObject.draftsman = this.object;
    hitObject.type = hit.fire_wound;
    hitObject.direction = registry.actor.position().sub(this.object.position());
    hitObject.bone("pelvis");
    hitObject.power = 1;
    hitObject.impulse = 10;
    this.object.hit(hitObject);

    const objectClsId: TXR_class_id = this.object.clsid();

    if (objectClsId === clsid.poltergeist_s) {
      logger.info("Releasing poltergeist_s:", this.object.name());

      const target_object: Optional<XR_cse_alife_object> = alife().object(this.object.id());

      if (target_object !== null) {
        alife().release(target_object, true);
      }
    }
  }

  /**
   * todo: Description.
   */
  public hit_callback(
    object: XR_game_object,
    amount: TCount,
    direction: XR_vector,
    who: XR_game_object,
    boneIndex: TLabel | TIndex
  ): void {
    if (who.id() === registry.actor.id()) {
      StatisticsManager.getInstance().updateBestWeapon(amount);
    }

    if (this.state[EScheme.HIT]) {
      issueSchemeEvent(this.object, this.state.hit, ESchemeEvent.HIT, object, amount, direction, who, boneIndex);
    }
  }

  /**
   * todo: Description.
   */
  public hear_callback(
    object: XR_game_object,
    sourceId: TNumberId,
    soundType: TXR_snd_type,
    soundPosition: XR_vector,
    soundPower: TRate
  ): void {
    if (sourceId !== object.id()) {
      ActionSchemeHear.onObjectHearSound(object, sourceId, soundType, soundPosition, soundPower);
    }
  }
}
