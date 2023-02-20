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
  TXR_snd_type,
  vector,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_hit,
  XR_net_packet,
  XR_object_binder,
  XR_reader,
  XR_vector,
} from "xray16";

import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { EScheme, ESchemeType, Optional } from "@/mod/lib/types";
import { ISimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { ISmartTerrain, setup_gulag_and_logic_on_spawn } from "@/mod/scripts/core/alife/SmartTerrain";
import { addObject, deleteObject, IStoredObject, offlineObjects, registry, resetObject } from "@/mod/scripts/core/db";
import { get_sim_obj_registry } from "@/mod/scripts/core/db/SimObjectsRegistry";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { StatisticsManager } from "@/mod/scripts/core/managers/StatisticsManager";
import { ActionSchemeHear } from "@/mod/scripts/core/schemes/hear/ActionSchemeHear";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { mobCapture } from "@/mod/scripts/core/schemes/mobCapture";
import { mobCaptured } from "@/mod/scripts/core/schemes/mobCaptured";
import { mobRelease } from "@/mod/scripts/core/schemes/mobRelease";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { action, getObjectSquad } from "@/mod/scripts/utils/alife";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("MonsterBinder");

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
    sound_type: TXR_snd_type,
    sound_position: XR_vector,
    sound_power: number
  ): void;
}

export const MonsterBinder: IMonsterBinder = declare_xr_class("MonsterBinder", object_binder, {
  __init(object: XR_game_object): void {
    object_binder.__init(this, object);

    this.loaded = false;
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    this.st = resetObject(this.object);

    this.object.set_callback(callback.patrol_path_in_point, this.waypoint_callback, this);
    this.object.set_callback(callback.hit, this.hit_callback, this);
    this.object.set_callback(callback.death, this.death_callback, this);
    this.object.set_callback(callback.sound, this.hear_callback, this);
  },
  update(delta: number): void {
    object_binder.update(this, delta);

    if (registry.actorCombat.get(this.object.id()) && this.object.best_enemy() === null) {
      registry.actorCombat.delete(this.object.id());
    }

    const squad: Optional<ISimSquad> = getObjectSquad(this.object);
    const object_alive: boolean = this.object.alive();

    if (!object_alive) {
      return;
    }

    this.object.set_tip_text("");

    const st = registry.objects.get(this.object.id());

    if (st !== null && st.active_scheme !== null) {
      trySwitchToAnotherSection(this.object, st[st.active_scheme!], registry.actor);
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
      if (mobCaptured(this.object)) {
        mobRelease(this.object, MonsterBinder.__name);
      }

      return;
    }

    if (squad && squad.current_action && squad.current_action.name === "reach_target") {
      const squad_target = get_sim_obj_registry().objects.get(squad.assigned_target_id!);

      if (squad_target === null) {
        return;
      }

      const [target_pos, target_lv_id, target_gv_id] = squad_target.get_location();

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

    if (this.st.active_section !== null) {
      issueEvent(this.object, this.st[this.st.active_scheme as string], "update", delta);
    }
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, MonsterBinder.__name);

    object_binder.save(this, packet);
    save_obj(this.object, packet);

    setSaveMarker(packet, true, MonsterBinder.__name);
  },
  load(reader: XR_reader): void {
    this.loaded = true;

    setLoadMarker(reader, false, MonsterBinder.__name);
    object_binder.load(this, reader);
    load_obj(this.object, reader);

    setLoadMarker(reader, true, MonsterBinder.__name);
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    logger.info("Net spawn:", object.name());

    const st = registry.objects.get(this.object.id());
    const on_offline_condlist = st !== null && st.overrides && st.overrides.on_offline_condlist;

    if (on_offline_condlist !== null) {
      pickSectionFromCondList(registry.actor, this.object, on_offline_condlist as any);
    }

    if (!this.object.alive()) {
      return true;
    }

    if (alife().object(this.object.id()) === null) {
      return false;
    }

    addObject(this.object);

    const se_obj = alife().object<XR_cse_alife_creature_abstract>(this.object.id())!;

    if (registry.spawnedVertexes.has(se_obj.id)) {
      this.object.set_npc_position(level.vertex_position(registry.spawnedVertexes.get(se_obj.id)));
      registry.spawnedVertexes.delete(se_obj.id);
    } else if (offlineObjects.has(se_obj.id) && offlineObjects.get(se_obj.id).level_vertex_id !== null) {
      this.object.set_npc_position(level.vertex_position(offlineObjects.get(se_obj.id).level_vertex_id));
    } else if (se_obj.m_smart_terrain_id !== MAX_UNSIGNED_16_BIT) {
      const smart_terrain = alife().object<ISmartTerrain>(se_obj.m_smart_terrain_id);

      if (smart_terrain !== null && smart_terrain.arriving_npc.get(se_obj.id) === null) {
        const smart_task = smart_terrain.job_data.get(smart_terrain.npc_info.get(se_obj.id).job_id).alife_task;

        this.object.set_npc_position(smart_task.position());
      }
    }

    setup_gulag_and_logic_on_spawn(this.object, this.st, object, ESchemeType.MONSTER, this.loaded);

    return true;
  },
  net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    this.object.set_callback(callback.death, null);
    this.object.set_callback(callback.patrol_path_in_point, null);
    this.object.set_callback(callback.hit, null);
    this.object.set_callback(callback.sound, null);

    GlobalSound.stop_sounds_by_id(this.object.id());
    registry.actorCombat.delete(this.object.id());

    const st = registry.objects.get(this.object.id());

    if (st !== null && st.active_scheme !== null) {
      issueEvent(this.object, st[st.active_scheme as string], "net_destroy");
    }

    const offlineObject = offlineObjects.get(this.object.id());

    if (offlineObject !== null) {
      offlineObject.level_vertex_id = this.object.level_vertex_id();
      offlineObject.active_section = st.active_section;
    }

    deleteObject(this.object);
    registry.objects.delete(this.object.id());
    object_binder.net_destroy(this);
  },
  net_save_relevant(): boolean {
    return true;
  },
  extrapolate_callback(): Optional<boolean> {
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
  },
  waypoint_callback(obj: XR_game_object, action_type: number, index: number): void {
    if (this.st.active_section !== null) {
      issueEvent(this.object, this.st[this.st.active_scheme as string], "waypoint_callback", obj, action_type, index);
    }
  },
  death_callback(victim: XR_game_object, killer: XR_game_object): void {
    registry.actorCombat.delete(this.object.id());

    this.hit_callback(victim, 1, new vector().set(0, 0, 0), killer, "from_death_callback");

    if (killer.id() === registry.actor.id()) {
      const statisticsManager: StatisticsManager = StatisticsManager.getInstance();

      statisticsManager.incrementKilledMonstersCount();
      statisticsManager.updateBestMonsterKilled(this.object);
    }

    if (this.st.mob_death) {
      issueEvent(this.object, this.st.mob_death, "death_callback", victim, killer);
    }

    if (this.st.active_section) {
      issueEvent(this.object, this.st[this.st.active_scheme as EScheme], "death_callback", victim, killer);
    }

    const h: XR_hit = new hit();

    h.draftsman = this.object;
    h.type = hit.fire_wound;
    h.direction = registry.actor.position().sub(this.object.position());
    h.bone("pelvis");
    h.power = 1;
    h.impulse = 10;
    this.object.hit(h);

    const obj_clsid: TXR_cls_id = this.object.clsid();

    if (obj_clsid === clsid.poltergeist_s) {
      logger.info("Releasing poltergeist_s:", this.object.name());

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
    if (who.id() === registry.actor.id()) {
      StatisticsManager.getInstance().updateBestWeapon(amount);
    }

    if (this.st.hit) {
      issueEvent(this.object, this.st.hit, "hit_callback", obj, amount, const_direction, who, bone_index);
    }

    if (amount > 0) {
      logger.info("[hit] Hit done:", amount, who.name(), "->", obj.name());
    }
  },
  hear_callback(
    object: XR_game_object,
    source_id: number,
    sound_type: TXR_snd_type,
    sound_position: XR_vector,
    sound_power: number
  ): void {
    if (source_id !== object.id()) {
      ActionSchemeHear.hear_callback(object, source_id, sound_type, sound_position, sound_power);
    }
  },
} as IMonsterBinder);
