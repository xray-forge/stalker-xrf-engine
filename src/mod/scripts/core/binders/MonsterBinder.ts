import {
  alife,
  callback,
  clsid,
  cond,
  hit,
  level,
  move,
  object_binder,
  patrol,
  TXR_cls_id,
  vector,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_hit,
  XR_net_packet,
  XR_object_binder,
  XR_vector
} from "xray16";

import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import {
  addObject,
  deleteObject,
  getActor,
  IStoredObject,
  offlineObjects,
  spawnedVertexById,
  storage
} from "@/mod/scripts/core/db";
import { stype_mobile } from "@/mod/scripts/core/schemes";
import { get_sim_obj_registry } from "@/mod/scripts/se/SimObjectsRegistry";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { ISmartTerrain, setup_gulag_and_logic_on_spawn } from "@/mod/scripts/se/SmartTerrain";
import { action, getObjectSquad } from "@/mod/scripts/utils/alife";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const last_update = 0;
const log: LuaLogger = new LuaLogger("MonsterBinder");

export interface IMonsterBinder extends XR_object_binder {
  st: IStoredObject;

  loaded: boolean;

  extrapolate_callback(): Optional<boolean>;
  waypoint_callback(obj: XR_game_object, action_type: number, index: number): void;
  death_callback(victim: XR_game_object, killer: XR_game_object): void;
  hit_callback(
    obj: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: XR_game_object,
    bone_index: number | string
  ): void;
  hear_callback(
    object: XR_game_object,
    source_id: number,
    sound_type: string,
    sound_position: XR_vector,
    sound_power: number
  ): void;
}

export const MonsterBinder: IMonsterBinder = declare_xr_class("MonsterBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);
    this.loaded = false;
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    this.st = {};

    storage.set(this.object.id(), this.st);

    this.object.set_callback(callback.patrol_path_in_point, this.waypoint_callback, this);
    this.object.set_callback(callback.hit, this.hit_callback, this);
    this.object.set_callback(callback.death, this.death_callback, this);
    this.object.set_callback(callback.sound, this.hear_callback, this);
  },
  update(delta: number): void {
    object_binder.update(this, delta);

    if (get_global("xr_combat_ignore").fighting_with_actor_npcs[this.object.id()] && this.object.best_enemy() == null) {
      get_global("xr_combat_ignore").fighting_with_actor_npcs[this.object.id()] = null;
    }

    const squad: Optional<ISimSquad> = getObjectSquad(this.object);
    const object_alive: boolean = this.object.alive();

    if (!object_alive) {
      return;
    }

    this.object.set_tip_text("");

    const st = storage.get(this.object.id());

    if (st !== null && st.active_scheme !== null) {
      get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(
        this.object,
        st[st.active_scheme!],
        getActor()
      );
    }

    if (squad !== null && squad.commander_id() === this.object.id()) {
      squad.update();
    }

    this.object.info_clear();

    const active_section = st !== null && st.active_section;

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
      if (get_global<AnyCallablesModule>("xr_logic").mob_captured(this.object)) {
        get_global<AnyCallablesModule>("xr_logic").mob_release(this.object);
      }

      return;
    }

    if (squad && squad.current_action && squad.current_action.name === "reach_target") {
      const squad_target = get_sim_obj_registry().objects.get(squad.assigned_target_id);

      if (squad_target === null) {
        return;
      }

      const [target_pos, target_lv_id, target_gv_id] = squad_target.get_location();

      get_global<AnyCallablesModule>("xr_logic").mob_capture(this.object, true);

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

    if (this.st.active_section !== null) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st[this.st.active_scheme as string],
        "update",
        delta
      );
    }
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "generic_object_binder");
    object_binder.save(this, packet);
    get_global<AnyCallablesModule>("xr_logic").save_obj(this.object, packet);
    setSaveMarker(packet, true, "generic_object_binder");
  },
  load(packet: XR_net_packet): void {
    this.loaded = true;
    setLoadMarker(packet, false, "generic_object_binder");
    object_binder.load(this, packet);
    get_global<AnyCallablesModule>("xr_logic").load_obj(this.object, packet);
    setLoadMarker(packet, true, "generic_object_binder");
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    log.info("Net spawn:", object.name());

    const st = storage.get(this.object.id());
    const on_offline_condlist = st !== null && st.overrides && st.overrides.on_offline_condlist;

    if (on_offline_condlist !== null) {
      get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(
        getActor(),
        this.object,
        on_offline_condlist
      );
    }

    if (!this.object.alive()) {
      return true;
    }

    if (alife().object(this.object.id()) === null) {
      return false;
    }

    addObject(this.object);

    const se_obj = alife().object<XR_cse_alife_creature_abstract>(this.object.id())!;

    if (spawnedVertexById.has(se_obj.id)) {
      this.object.set_npc_position(level.vertex_position(spawnedVertexById.get(se_obj.id)));
      spawnedVertexById.delete(se_obj.id);
    } else if (offlineObjects.has(se_obj.id) && offlineObjects.get(se_obj.id).level_vertex_id !== null) {
      this.object.set_npc_position(level.vertex_position(offlineObjects.get(se_obj.id).level_vertex_id));
    } else if (se_obj.m_smart_terrain_id !== MAX_UNSIGNED_16_BIT) {
      const smart_terrain = alife().object<ISmartTerrain>(se_obj.m_smart_terrain_id);

      if (smart_terrain !== null && smart_terrain.arriving_npc.get(se_obj.id) === null) {
        const smart_task = smart_terrain.job_data.get(smart_terrain.npc_info.get(se_obj.id).job_id).alife_task;

        this.object.set_npc_position(smart_task.position());
      }
    }

    setup_gulag_and_logic_on_spawn(this.object, this.st, object, stype_mobile, this.loaded);

    return true;
  },
  net_destroy(): void {
    log.info("Net destroy:", this.object.name());

    this.object.set_callback(callback.death, null);
    this.object.set_callback(callback.patrol_path_in_point, null);
    this.object.set_callback(callback.hit, null);
    this.object.set_callback(callback.sound, null);

    get_global<AnyCallablesModule>("xr_sound").stop_sounds_by_id(this.object.id());
    get_global("xr_combat_ignore").fighting_with_actor_npcs[this.object.id()] = null;

    const st = storage.get(this.object.id());

    if (st !== null && st.active_scheme !== null) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        st[st.active_scheme as string],
        "net_destroy"
      );
    }

    const offlineObject = offlineObjects.get(this.object.id());

    if (offlineObject !== null) {
      offlineObject.level_vertex_id = this.object.level_vertex_id();
      offlineObject.active_section = st.active_section;
    }

    deleteObject(this.object);
    storage.delete(this.object.id());
    object_binder.net_destroy(this);
  },
  net_save_relevant(): boolean {
    return true;
  },
  extrapolate_callback(): Optional<boolean> {
    if (storage.get(this.object.id()) === null || storage.get(this.object.id()).object === null) {
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
  },
  waypoint_callback(obj: XR_game_object, action_type: number, index: number): void {
    if (this.st.active_section !== null) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st[this.st.active_scheme as string],
        "waypoint_callback",
        obj,
        action_type,
        index
      );
    }
  },
  death_callback(victim: XR_game_object, killer: XR_game_object): void {
    get_global("xr_combat_ignore").fighting_with_actor_npcs[this.object.id()] = null;

    this.hit_callback(victim, 1, new vector().set(0, 0, 0), killer, "from_death_callback");

    if (killer.id() === getActor()!.id()) {
      get_global<AnyCallablesModule>("xr_statistic").inc_killed_monsters_counter();
      get_global<AnyCallablesModule>("xr_statistic").set_best_monster(this.object);
    }

    if (this.st.mob_death) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st.mob_death,
        "death_callback",
        victim,
        killer
      );
    }

    if (this.st.active_section) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st[this.st.active_scheme as string],
        "death_callback",
        victim,
        killer
      );
    }

    const h: XR_hit = new hit();

    h.draftsman = this.object;
    h.type = hit.fire_wound;
    h.direction = getActor()!.position().sub(this.object.position());
    h.bone("pelvis");
    h.power = 1;
    h.impulse = 10;
    this.object.hit(h);

    const obj_clsid: TXR_cls_id = this.object.clsid();

    if (obj_clsid === clsid.poltergeist_s) {
      log.info("Releasing poltergeist_s:", this.object.name());

      const target_object: Optional<XR_cse_alife_object> = alife().object(this.object.id());

      if (target_object !== null) {
        alife().release(target_object, true);
      }
    }
  },
  hit_callback(
    obj: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: XR_game_object,
    bone_index: string | number
  ): void {
    if (who.id() === getActor()!.id()) {
      get_global<AnyCallablesModule>("xr_statistic").set_best_weapon(amount);
    }

    if (this.st.hit) {
      get_global<AnyCallablesModule>("xr_logic").issue_event(
        this.object,
        this.st.hit,
        "hit_callback",
        obj,
        amount,
        const_direction,
        who,
        bone_index
      );
    }

    if (amount > 0) {
      log.info("[hit] Hit done:", amount, who.name(), "->", obj.name());
    }
  },
  hear_callback(
    object: XR_game_object,
    source_id: number,
    sound_type: string,
    sound_position: XR_vector,
    sound_power: number,
    dst?: any
  ): void {
    if (source_id === object.id()) {
      return;
    }

    get_global<AnyCallablesModule>("xr_hear").hear_callback(object, source_id, sound_type, sound_position, sound_power);
  }
} as IMonsterBinder);
