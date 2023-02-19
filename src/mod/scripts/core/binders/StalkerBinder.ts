import {
  actor_stats,
  alife,
  callback,
  game_graph,
  game_object,
  ini_file,
  level,
  object_binder,
  patrol,
  property_evaluator_const,
  stalker_ids,
  system_ini,
  time_global,
  TXR_snd_type,
  vector,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_object_binder,
  XR_reader,
  XR_vector,
} from "xray16";

import { communities } from "@/mod/globals/communities";
import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { ESchemeType } from "@/mod/lib/types/scheme";
import { ActionSchemeHear } from "@/mod/scripts/core/ActionSchemeHear";
import {
  addEnemy,
  addObject,
  deleteEnemy,
  deleteObject,
  fighting_with_actor_npcs,
  getActor,
  getHeliEnemiesCount,
  goodwill,
  IStoredObject,
  offlineObjects,
  spawnedVertexById,
  storage,
} from "@/mod/scripts/core/db";
import { DUMMY_LTX } from "@/mod/scripts/core/db/IniFiles";
import { DropManager } from "@/mod/scripts/core/DropManager";
import { set_npc_sympathy, set_npcs_relation } from "@/mod/scripts/core/game_relations";
import { need_victim } from "@/mod/scripts/core/inventory_upgrades";
import { ActionDanger } from "@/mod/scripts/core/logic/ActionDanger";
import { ActionLight } from "@/mod/scripts/core/logic/ActionLight";
import { ActionSchemeCombat } from "@/mod/scripts/core/logic/ActionSchemeCombat";
import { ActionSchemeMeet } from "@/mod/scripts/core/logic/ActionSchemeMeet";
import { ActionSchemeReachTask } from "@/mod/scripts/core/logic/ActionSchemeReachTask";
import { ActionWoundManager } from "@/mod/scripts/core/logic/ActionWoundManager";
import { add_post_combat_idle } from "@/mod/scripts/core/logic/evaluators/PostCombatIdleEnemyEvaluator";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { StatisticsManager } from "@/mod/scripts/core/managers/StatisticsManager";
import { MoveManager } from "@/mod/scripts/core/MoveManager";
import { get_release_body_manager } from "@/mod/scripts/core/ReleaseBodyManager";
import { generic_scheme_overrides } from "@/mod/scripts/core/schemes/generic_scheme_overrides";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { DynamicMusicManager } from "@/mod/scripts/core/sound/DynamicMusicManager";
import { SoundTheme } from "@/mod/scripts/core/sound/SoundTheme";
import { loadTradeManager, saveTradeManager, updateTradeManager } from "@/mod/scripts/core/TradeManager";
import { disabled_phrases, loadNpcDialogs, saveNpcDialogs } from "@/mod/scripts/globals/dialog_manager";
import { get_sim_board } from "@/mod/scripts/se/SimBoard";
import { ISmartTerrain, setup_gulag_and_logic_on_spawn } from "@/mod/scripts/se/SmartTerrain";
import { bind_state_manager } from "@/mod/scripts/state_management/bind_state_manager";
import { mapDisplayManager } from "@/mod/scripts/ui/game/MapDisplayManager";
import { getCharacterCommunity, getObjectSquad, updateInvulnerability } from "@/mod/scripts/utils/alife";
import { getConfigString, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getObjectStoryId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("MotivatorBinder");

export interface IMotivatorBinder extends XR_object_binder {
  state: IStoredObject;

  loaded: boolean;
  last_update: number;
  first_update: boolean;
  e_index: Optional<number>;

  extrapolate_callback(cur_pt: number): boolean;
  clear_callbacks(): void;
  hit_callback(
    object: XR_game_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: string | number
  ): void;
  use_callback(obj: XR_game_object, who: XR_game_object): void;
  death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void;
  hear_callback(
    target: XR_game_object,
    who_id: number,
    sound_type: TXR_snd_type,
    sound_position: XR_vector,
    sound_power: number
  ): void;
}

// todo: Rewrite with event emitting system
export const StalkerBinder: IMotivatorBinder = declare_xr_class("StalkerBinder", object_binder, {
  __init(object: XR_game_object): void {
    object_binder.__init(this, object);

    this.loaded = false;
    this.last_update = 0;
    this.first_update = false;
    // --    this.need_relation_update = false
  },
  reinit(): void {
    object_binder.reinit(this);

    storage.set(this.object.id(), { followers: {} });
    this.state = storage.get(this.object.id());

    this.state.state_mgr = bind_state_manager(this.object);

    this.state.move_mgr = new MoveManager(this.object);
    this.state.move_mgr.initialize();
  },
  extrapolate_callback(cur_pt: number): boolean {
    if (this.state.active_section) {
      issueEvent(this.object, this.state[this.state.active_scheme!], "extrapolate_callback");
      this.state.move_mgr.extrapolate_callback(this.object);
    }

    if (new patrol(this.object.patrol()!).flags(cur_pt).get() === 0) {
      return true;
    }

    return false;
  },
  net_spawn(obj: XR_cse_alife_object): boolean {
    const visual = getConfigString(system_ini(), this.object.section(), "set_visual", obj, false, "");
    const actor: Optional<XR_game_object> = getActor()!;

    if (visual !== null && visual !== "") {
      if (visual === "actor_visual") {
        this.object.set_visual_name(actor.get_visual_name());
      } else {
        this.object.set_visual_name(visual);
      }
    }

    DynamicMusicManager.NPC_TABLE.set(this.object.id(), this.object.id());

    if (!object_binder.net_spawn(this, obj)) {
      return false;
    }

    addObject(this.object);

    this.object.set_patrol_extrapolate_callback(this.extrapolate_callback, this);
    this.object.set_callback(callback.hit, this.hit_callback, this);
    this.object.set_callback(callback.death, this.death_callback, this);
    this.object.set_callback(callback.use_object, this.use_callback, this);
    this.object.set_callback(callback.sound, this.hear_callback, this);

    this.object.apply_loophole_direction_distance(1.0);

    if (this.loaded === false) {
      let char_ini: Optional<XR_ini_file> = null;
      // todo: Can be null?
      const spawn_ini: Optional<XR_ini_file> = this.object.spawn_ini();
      let filename = null;

      if (spawn_ini !== null) {
        filename = getConfigString(spawn_ini, "logic", "cfg", this.object, false, "");
      }

      if (filename !== null) {
        char_ini = new ini_file(filename);
      } else {
        char_ini = this.object.spawn_ini() || DUMMY_LTX;
      }

      loadInfo(this.object, char_ini, null);
    }

    if (!this.object.alive()) {
      this.object.death_sound_enabled(false);
      get_release_body_manager().moving_dead_body(this.object);

      return true;
    }

    const relation = goodwill.relations && goodwill.relations.get(this.object.id());

    if (relation !== null && actor) {
      set_npcs_relation(this.object, actor, relation);
    }

    const sympathy = goodwill.sympathy && goodwill.sympathy.get(this.object.id());

    if (sympathy !== null) {
      set_npc_sympathy(this.object, sympathy);
    }

    addEnemy(this.object);
    this.e_index = getHeliEnemiesCount() - 1;

    SoundTheme.init_npc_sound(this.object);

    if (getObjectStoryId(this.object.id()) === "zat_b53_artefact_hunter_1") {
      const manager = this.object.motivation_action_manager();

      manager.remove_evaluator(stalker_ids.property_anomaly);
      manager.add_evaluator(stalker_ids.property_anomaly, new property_evaluator_const(false));
    }

    ActionSchemeReachTask.add_reach_task_action(this.object);

    // todo: Why? Already same in callback?
    const se_obj = alife().object<XR_cse_alife_human_abstract>(this.object.id());

    if (se_obj !== null) {
      if (spawnedVertexById.get(se_obj.id) !== null) {
        this.object.set_npc_position(level.vertex_position(spawnedVertexById.get(se_obj.id)));
        spawnedVertexById.delete(se_obj.id);
      } else if (offlineObjects.get(se_obj.id) !== null && offlineObjects.get(se_obj.id).level_vertex_id !== null) {
        this.object.set_npc_position(level.vertex_position(offlineObjects.get(se_obj.id).level_vertex_id));
      } else if (se_obj.m_smart_terrain_id !== MAX_UNSIGNED_16_BIT) {
        const smart_terrain = alife().object<ISmartTerrain>(se_obj.m_smart_terrain_id)!;

        if (smart_terrain.arriving_npc.get(se_obj.id) === null) {
          const smart_task = smart_terrain.job_data.get(smart_terrain.npc_info.get(se_obj.id).job_id).alife_task;

          this.object.set_npc_position(smart_task.position());
        }
      }
    }

    setup_gulag_and_logic_on_spawn(this.object, this.state, obj, ESchemeType.STALKER, this.loaded);

    if (getCharacterCommunity(this.object) !== communities.zombied) {
      add_post_combat_idle(this.object);
    }

    this.object.group_throw_time_interval(2000);

    return true;
  },
  net_destroy(): void {
    DynamicMusicManager.NPC_TABLE.delete(this.object.id());

    fighting_with_actor_npcs.delete(this.object.id());
    GlobalSound.stop_sounds_by_id(this.object.id());

    const st: IStoredObject = storage.get(this.object.id());

    if (st.active_scheme) {
      issueEvent(this.object, st[st.active_scheme], "net_destroy", this.object);
    }

    if (this.state.reach_task) {
      issueEvent(this.object, this.state.reach_task, "net_destroy", this.object);
    }

    const on_offline_condlist =
      storage.get(this.object.id()) &&
      storage.get(this.object.id()).overrides &&
      storage.get(this.object.id()).overrides!.on_offline_condlist;

    if (on_offline_condlist !== null) {
      pickSectionFromCondList(getActor() as XR_game_object, this.object, on_offline_condlist as any);
    }

    if (offlineObjects.get(this.object.id())) {
      offlineObjects.get(this.object.id()).level_vertex_id = this.object.level_vertex_id();
      offlineObjects.get(this.object.id()).active_section = storage.get(this.object.id()).active_section;
    }

    deleteObject(this.object);

    this.clear_callbacks();

    if (this.e_index !== null) {
      deleteEnemy(this.e_index);
    }

    object_binder.net_destroy(this);
  },
  clear_callbacks(): void {
    this.object.set_patrol_extrapolate_callback(null);
    this.object.set_callback(callback.hit, null);
    this.object.set_callback(callback.death, null);
    this.object.set_callback(callback.sound, null);
  },
  hit_callback(
    obj: XR_game_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: string | number
  ): void {
    const actor: XR_game_object = getActor()!;

    // -- FIXME: �������� ������� ���� �� �������������� � ����� storage, � �� ��������...
    if (who?.id() === actor.id()) {
      StatisticsManager.getInstance().updateBestWeapon(amount);

      /* --[[
      const se_obj = alife():object(obj:id())
      if se_obj and se_obj.m_smart_terrain_id !== 65535 and amount > 0 {
        const smart_obj = alife():object(se_obj.m_smart_terrain_id)
        smart_obj:set_alarm()

        if smart_obj.base_on_actor_control !== null {
          smart_obj.base_on_actor_control:actor_attack()
        }
      }
    ]]*/

      if (amount > 0) {
        for (const [k, v] of get_sim_board().smarts) {
          const smart = v.smrt;

          if (smart.base_on_actor_control !== null) {
            const level_id = game_graph().vertex(smart.m_game_vertex_id).level_id();
            const actor_level_id = game_graph().vertex(alife().actor().m_game_vertex_id).level_id();

            if (level_id === actor_level_id && actor.position().distance_to_sqr(smart.position) <= 6400) {
              if (this.object.relation(actor) !== game_object.enemy) {
                smart.base_on_actor_control.actor_attack();
              }
            }
          }
        }
      }
    }

    if (this.state.active_section) {
      issueEvent(
        this.object,
        this.state[this.state.active_scheme!],
        "hit_callback",
        obj,
        amount,
        local_direction,
        who,
        bone_index
      );
    }

    if (this.state.combat_ignore) {
      issueEvent(this.object, this.state.combat_ignore, "hit_callback", obj, amount, local_direction, who, bone_index);
    }

    if (this.state.combat) {
      issueEvent(this.object, this.state.combat, "hit_callback", obj, amount, local_direction, who, bone_index);
    }

    if (this.state.hit) {
      issueEvent(this.object, this.state.hit, "hit_callback", obj, amount, local_direction, who, bone_index);
    }

    if (bone_index !== 15 && amount > this.object.health * 100) {
      this.object.health = 0.15;
    }

    if (amount > 0) {
      ActionWoundManager.hit_callback(obj.id());
    }
  },
  death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void {
    this.hit_callback(victim, 1, new vector().set(0, 0, 0), who, "from_death_callback");

    DynamicMusicManager.NPC_TABLE.delete(this.object.id());
    fighting_with_actor_npcs.delete(this.object.id());

    const st = storage.get(this.object.id());
    const npc = this.object;
    const actor = getActor()!;

    mapDisplayManager.removeNpcSpot(npc, st);

    // --' }  --
    if (who?.id() === actor.id()) {
      const statisticsManager: StatisticsManager = StatisticsManager.getInstance();

      // -- todo: Probably only for stalkers so should be called only for increment.
      statisticsManager.incrementKilledStalkersCount();
      statisticsManager.updateBestMonsterKilled(npc);
    }

    // --' �������� ������� ��� ������.
    const known_info = getConfigString(st.ini!, st.section_logic!, "known_info", this.object, false, "", null);

    loadInfo(this.object, st.ini!, known_info);

    // --' ������������� �������� �������� �������� ����� ������������ ������������ �������
    if (this.state.state_mgr !== null) {
      this.state.state_mgr!.animation.set_state(null, true);
    }

    if (this.state.reach_task) {
      issueEvent(this.object, this.state.reach_task, "death_callback", victim, who);
    }

    if (this.state.death) {
      issueEvent(this.object, this.state.death, "death_callback", victim, who);
    }

    if (this.state.active_section) {
      issueEvent(this.object, this.state[this.state.active_scheme!], "death_callback", victim, who);
    }

    ActionLight.check_light(this.object);
    create_xr_class_instance(DropManager, this.object).create_release_item();
    deleteEnemy(this.e_index!);

    this.clear_callbacks();
    // --' ������� ��������� ������� ������.
    if (actor_stats.remove_from_ranking !== null) {
      const community = getCharacterCommunity(this.object);

      if (community === communities.zombied || community === communities.monolith) {
        // placeholder
      } else {
        actor_stats.remove_from_ranking(this.object.id());
      }
    }

    get_release_body_manager().moving_dead_body(this.object);
  },
  use_callback(obj: XR_game_object, who: XR_game_object): void {
    if (this.object.alive()) {
      need_victim(obj);

      ActionSchemeMeet.notify_on_use(obj, who);

      disabled_phrases.delete(obj.id());
      if (this.state.active_section) {
        issueEvent(this.object, this.state[this.state.active_scheme!], "use_callback", obj, who);
      }
    }
  },
  update(delta: number): void {
    object_binder.update(this, delta);

    if (fighting_with_actor_npcs.get(this.object.id()) && this.object.best_enemy() === null) {
      fighting_with_actor_npcs.delete(this.object.id());
    }

    const object = this.object;
    const object_alive = object.alive();
    const actor = getActor();

    update_logic(object);

    if (this.first_update === false) {
      if (object_alive === false) {
        create_xr_class_instance(DropManager, object).create_release_item();
      }

      this.first_update = true;
    }

    if (time_global() - this.last_update > 1000) {
      ActionLight.check_light(object);
      this.last_update = time_global();
    }

    if (this.state.state_mgr) {
      if (object_alive) {
        this.state.state_mgr.update();

        if (this.state.state_mgr.combat === false && this.state.state_mgr.alife === false) {
          // --and this.st.state_mgr.planner:current_action_id() == this.st.state_mgr.operators["}"]
          updateTradeManager(object);
        }
      } else {
        this.state.state_mgr = null;
      }
    }

    if (object_alive) {
      GlobalSound.update(object.id());
      ActionSchemeMeet.process_npc_usability(object);
      updateInvulnerability(this.object);
    }

    const squad = getObjectSquad(this.object);

    if (squad !== null) {
      if (squad.commander_id() === this.object.id()) {
        squad.update();
      }
    }

    object.info_clear();

    if (object_alive) {
      const active_section = storage.get(object.id()).active_section;

      if (active_section) {
        object.info_add("section: " + active_section);
      }

      const best_enemy = object.best_enemy();

      if (best_enemy) {
        object.info_add("enemy: " + best_enemy.name());
      }

      const best_danger = object.best_danger();

      if (best_danger) {
        object.info_add("danger: " + ActionDanger.get_danger_name(best_danger));
      }

      object.info_add(object.name() + " [" + object.team() + "][" + object.squad() + "][" + object.group() + "]");

      if (alife().object(object.id()) === null) {
        return;
      }

      if (squad !== null) {
        object.info_add("squad_id: " + squad.section_name());
        if (squad.current_action !== null) {
          const target =
            squad.assigned_target_id &&
            alife().object(squad.assigned_target_id) &&
            alife().object(squad.assigned_target_id)!.name();

          this.object.info_add("current_action: " + squad.current_action.name + "[" + tostring(target) + "]");
        }
      }
    } else {
      object.set_tip_text_default();
    }
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, StalkerBinder.__name);

    object_binder.save(this, packet);
    save_obj(this.object, packet);
    saveTradeManager(this.object, packet);
    GlobalSound.save_npc(packet, this.object.id());
    saveNpcDialogs(packet, this.object.id());

    setSaveMarker(packet, true, StalkerBinder.__name);
  },
  load(reader: XR_reader): void {
    this.loaded = true;

    setLoadMarker(reader, false, StalkerBinder.__name);

    object_binder.load(this, reader);
    load_obj(this.object, reader);
    loadTradeManager(this.object, reader);
    GlobalSound.load_npc(reader, this.object.id());
    loadNpcDialogs(reader, this.object.id());

    setLoadMarker(reader, true, StalkerBinder.__name);
  },
  hear_callback(
    target: XR_game_object,
    who_id: number,
    sound_type: TXR_snd_type,
    sound_position: XR_vector,
    sound_power: number
  ): void {
    if (who_id === target.id()) {
      return;
    }

    ActionSchemeHear.hear_callback(target, who_id, sound_type, sound_position, sound_power);
  },
} as IMotivatorBinder);

export function update_logic(object: XR_game_object): void {
  const object_alive = object.alive();
  const st = storage.get(object.id());
  const actor = getActor()!;
  const st_combat = st.combat!;

  if (st !== null && st.active_scheme !== null && object_alive) {
    let switched = false;
    const manager = object.motivation_action_manager();

    if (manager.initialized() && manager.current_action_id() === stalker_ids.action_combat_planner) {
      const overrides = generic_scheme_overrides(object);

      if (overrides !== null) {
        if (overrides.get("on_combat")) {
          pickSectionFromCondList(actor, object, overrides.get("on_combat").condlist);
        }

        if (st_combat && (st_combat as any).logic) {
          if (!trySwitchToAnotherSection(object, st_combat, actor)) {
            if (overrides.get("combat_type")) {
              ActionSchemeCombat.set_combat_type(object, actor, overrides);
            }
          } else {
            switched = true;
          }
        }
      } else {
        ActionSchemeCombat.set_combat_type(object, actor, st_combat);
      }
    }

    if (!switched) {
      trySwitchToAnotherSection(object, st[st.active_scheme!], actor);
    }
  } else {
    ActionSchemeCombat.set_combat_type(object, actor, st_combat);
  }
}

function loadInfo(npc: XR_game_object, char_ini: XR_ini_file, known_info: Optional<string>) {
  known_info = known_info === null ? "known_info" : known_info;

  if (char_ini.section_exist(known_info)) {
    const n = char_ini.line_count(known_info);

    for (const i of $range(0, n - 1)) {
      const [result, id, value] = char_ini.r_line(known_info, i, "", "");

      npc.give_info_portion(id);
    }
  }
}
