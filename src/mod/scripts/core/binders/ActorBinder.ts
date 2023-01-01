import { mapDisplayManager } from "scripts/ui/game/MapDisplayManager";
import {
  XR_CGameTask,
  XR_cse_alife_creature_actor,
  XR_game_object,
  XR_net_packet,
  XR_object_binder,
  actor_stats,
  alife,
  callback,
  command_line,
  device,
  game,
  get_console,
  level,
  object_binder,
  task,
  time_global,
  vector,
  TXR_TaskState
} from "xray16";

import { game_difficulties_by_number } from "@/mod/globals/game_difficulties";
import { AnyCallable, AnyCallablesModule, Optional } from "@/mod/lib/types";
import {
  ARTEFACT_WAYS_BY_ARTEFACT_ID,
  PARENT_ZONES_BY_ARTEFACT_ID
} from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { isArtefact } from "@/mod/scripts/core/checkers";
import { addActor, deleteActor, getActor, IStoredObject, scriptIds, storage, zoneByName } from "@/mod/scripts/core/db";
import { send_task } from "@/mod/scripts/core/NewsManager";
import { getTreasureManager } from "@/mod/scripts/core/TreasureManager";
import { get_sim_board } from "@/mod/scripts/se/SimBoard";
import { get_sim_obj_registry } from "@/mod/scripts/se/SimObjectsRegistry";
import { ITaskManager } from "@/mod/scripts/se/task/TaskManager";
import { giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getTableSize } from "@/mod/scripts/utils/table";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

let weapon_hide: LuaTable<number, boolean> = new LuaTable();
let travel_func: Optional<AnyCallable> = null;

const log: LuaLogger = new LuaLogger("ActorBinder");

const detective_achievement_items: LuaTable<number, string> = ["medkit", "antirad", "bandage"] as any;

const mutant_hunter_achievement_items: LuaTable<number, string> = [
  "ammo_5.45x39_ap",
  "ammo_5.56x45_ap",
  "ammo_9x39_ap",
  "ammo_5.56x45_ap",
  "ammo_12x76_zhekan"
] as any;

export interface IActorBinder extends XR_object_binder {
  bCheckStart: boolean;
  f_surge_manager_loaded: boolean;

  weather_manager: any;
  task_manager: ITaskManager;
  surge_manager: any;

  already_jumped: boolean;
  loaded: boolean;
  spawn_frame: number;

  last_level_name: Optional<string>;
  deimos_intensity: Optional<any>;
  loaded_active_slot: number;
  loaded_slot_applied: boolean;

  weapon_hide: boolean;
  weapon_hide_in_dialog: boolean;

  last_detective_achievement_spawn_time: Optional<any>;
  last_mutant_hunter_achievement_spawn_time: Optional<any>;

  st: IStoredObject;

  take_item_from_box(box: XR_game_object, item: XR_game_object): void;
  info_callback(npc: XR_game_object, info_id: string): void;
  on_trade(item: XR_game_object, sell_bye: boolean, money: number): void;
  article_callback(): void;
  on_item_take(obj: XR_game_object): void;
  on_item_drop(object: XR_game_object): void;
  use_inventory_item(obj: XR_game_object): void;
  task_callback(_task: XR_CGameTask, _state: number): void;
  check_detective_achievement(): void;
  check_mutant_hunter_achievement(): void;
}

export const ActorBinder: IActorBinder = declare_xr_class("ActorBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);

    log.info("Init new actor binder:", object.name());

    this.bCheckStart = false;
    this.weather_manager = get_global<AnyCallablesModule>("level_weathers").get_weather_manager();
    this.surge_manager = get_global<AnyCallablesModule>("surge_manager").get_surge_manager();
    this.last_level_name = null;
    this.deimos_intensity = null;
    this.loaded_active_slot = 3;
    this.loaded_slot_applied = false;

    this.last_detective_achievement_spawn_time = null;
    this.last_mutant_hunter_achievement_spawn_time = null;
  },
  net_spawn(data: XR_cse_alife_creature_actor): boolean {
    log.info("Net spawn:", data.name());

    level.show_indicators();

    this.bCheckStart = true;
    this.weapon_hide = false;
    this.weapon_hide_in_dialog = false;

    weapon_hide = new LuaTable();

    if (object_binder.net_spawn(this, data) === false) {
      return false;
    }

    addActor(this.object);

    (getActor() as any).deimos_intensity = this.deimos_intensity;

    this.deimos_intensity = null;

    if (this.st.disable_input_time == null) {
      level.enable_input();
    }

    get_global<AnyCallablesModule>("xr_s").on_game_load();
    this.weather_manager.reset();

    get_global<AnyCallablesModule>("death_manager").init_drop_settings();

    this.task_manager = get_global("task_manager").get_task_manager();
    this.spawn_frame = device().frame;
    this.already_jumped = false;
    this.loaded = false;

    return true;
  },
  net_destroy(): void {
    log.info("Net destroy:", this.object.name());

    get_global<AnyCallablesModule>("xr_sound").stop_sounds_by_id(this.object.id());

    const board_factions = get_sim_board().players;

    if (board_factions !== null) {
      for (const [k, v] of board_factions) {
        get_global<AnyCallablesModule>("xr_sound").stop_sounds_by_id(v.id);
      }
    }

    if (actor_stats.remove_from_ranking !== null) {
      actor_stats.remove_from_ranking(this.object.id());
    }

    level.show_weapon(true);
    deleteActor();

    this.object.set_callback(callback.inventory_info, null);
    this.object.set_callback(callback.article_info, null);
    this.object.set_callback(callback.on_item_take, null);
    this.object.set_callback(callback.on_item_drop, null);
    this.object.set_callback(callback.task_state, null);
    this.object.set_callback(callback.level_border_enter, null);
    this.object.set_callback(callback.level_border_exit, null);
    this.object.set_callback(callback.take_item_from_box, null);
    this.object.set_callback(callback.use_object, null);

    if (get_global("amb_vol") !== 0) {
      get_console().execute("snd_volume_eff " + tostring(get_global("amb_vol")));
      declare_global("amb_vol", 0);
    }

    if (get_global("mus_vol") !== 0) {
      get_console().execute("snd_volume_music " + tostring(get_global("mus_vol")));
      declare_global("mus_vol", 0);
    }

    if (get_global("sr_psy_antenna").psy_antenna) {
      get_global("sr_psy_antenna").psy_antenna.destroy();
      get_global("sr_psy_antenna").psy_antenna = false;
    }

    get_global<AnyCallablesModule>("xrs_dyn_music").finish_theme();
    get_global<AnyCallablesModule>("xr_s").on_actor_destroy();

    object_binder.net_destroy(this);
  },
  reinit(): void {
    object_binder.reinit(this);

    const npc_id = this.object.id();

    storage.set(npc_id, {});

    this.st = storage.get(npc_id);
    this.st.pstor = null;

    this.object.set_callback(callback.inventory_info, this.info_callback, this);
    this.object.set_callback(callback.on_item_take, this.on_item_take, this);
    this.object.set_callback(callback.on_item_drop, this.on_item_drop, this);
    this.object.set_callback(callback.trade_sell_buy_item, this.on_trade, this);
    this.object.set_callback(callback.task_state, this.task_callback, this);
    this.object.set_callback(callback.take_item_from_box, this.take_item_from_box, this);
    this.object.set_callback(callback.use_object, this.use_inventory_item, this);
  },
  take_item_from_box(box: XR_game_object, item: XR_game_object): void {
    log.info("Take item from box:", box.name(), item.name());

    const box_name = box.name();
  },
  info_callback(npc: XR_game_object, info_id: string): void {
    log.info("[info callback]");
  },
  on_trade(item, sell_bye, money): void {
    const game_stats = get_global<AnyCallablesModule>("game_stats");

    if (sell_bye == true) {
      game_stats.money_trade_update(money);
    } else {
      game_stats.money_trade_update(-money);
    }
  },
  article_callback(): void {},
  on_item_take(obj: XR_game_object): void {
    log.info("On item take:", obj.name());

    if (isArtefact(obj)) {
      const anomal_zone = PARENT_ZONES_BY_ARTEFACT_ID.get(obj.id());

      if (anomal_zone !== null) {
        anomal_zone.onArtefactTaken(obj);
      } else {
        ARTEFACT_WAYS_BY_ARTEFACT_ID.delete(obj.id());
      }

      const artefact = obj.get_artefact();

      artefact.FollowByPath("NULL", 0, new vector().set(500, 500, 500));
      get_global("xr_statistic").inc_founded_artefacts_counter(obj.id());
    }

    getTreasureManager().on_item_take(obj.id());
  },
  on_item_drop(object: XR_game_object): void {},
  use_inventory_item(obj: XR_game_object): void {
    if (obj !== null) {
      const s_obj = alife().object(obj.id());

      if (s_obj && s_obj.section_name() == "drug_anabiotic") {
        get_global<AnyCallablesModule>("xr_effects").disable_ui_only(getActor(), null);

        level.add_cam_effector("camera_effects\\surge_02.anm", 10, false, "_extern.anabiotic_callback");
        level.add_pp_effector("surge_fade.ppe", 11, false);

        giveInfo("anabiotic_in_process");

        declare_global("mus_vol", get_console().get_float("snd_volume_music"));
        declare_global("amb_vol", get_console().get_float("snd_volume_eff"));

        get_console().execute("snd_volume_music 0");
        get_console().execute("snd_volume_eff 0");
      }
    }
  },
  task_callback(_task, _state: TXR_TaskState): void {
    if (_state !== task.fail) {
      if (_state === task.completed) {
        send_task(getActor(), "complete", _task);
      } else {
        send_task(getActor(), "new", _task);
      }
    }

    get_global<AnyCallablesModule>("_extern").task_callback(_task, _state);
  },
  update(delta: number): void {
    object_binder.update(this, delta);

    const [index] = string.find(command_line(), "-designer");

    if (index !== null) {
      return;
    }

    if (
      this.already_jumped === false &&
      get_global("jump_level").need_jump === true &&
      device().frame > this.spawn_frame + 2000
    ) {
      get_global("jump_level").try_to_jump();
      this.already_jumped = true;

      return;
    }

    if (travel_func !== null) {
      travel_func();
    }

    const time = time_global();

    get_global<AnyCallablesModule>("game_stats").update(delta, this.object);
    this.weather_manager.update();

    this.check_detective_achievement();
    this.check_mutant_hunter_achievement();

    get_global<AnyCallablesModule>("xr_sound").update(this.object.id());

    if (
      this.st.disable_input_time !== null &&
      game.get_game_time().diffSec(this.st.disable_input_time) >= this.st.disable_input_idle
    ) {
      level.enable_input();
      this.st.disable_input_time = null;
    }

    if (this.object.is_talking()) {
      if (this.weapon_hide_in_dialog === false) {
        this.object.hide_weapon();
        log.info("Hiding weapon in dialog");
        this.weapon_hide_in_dialog = true;
      }
    } else {
      if (this.weapon_hide_in_dialog == true) {
        log.info("Restoring weapon in dialog");
        this.object.restore_weapon();
        this.weapon_hide_in_dialog = false;
      }
    }

    if (check_for_weapon_hide_by_zones() === true) {
      if (this.weapon_hide === false) {
        log.info("Hiding weapon");
        this.object.hide_weapon();
        this.weapon_hide = true;
      }
    } else {
      if (this.weapon_hide === true) {
        log.info("Restoring weapon");
        this.object.restore_weapon();
        this.weapon_hide = false;
      }
    }

    if (get_global("sr_psy_antenna").psy_antenna) {
      get_global("sr_psy_antenna").psy_antenna.update(delta);
    }

    /**
     * todo: Not implemented originally.
     *
     *  if this.object.radiation >= 0.7 then
     *    const hud = get_hud()
     *    const custom_static = hud:GetCustomStatic("cs_radiation_danger")
     *    if custom_static == null then
     *      hud:AddCustomStatic("cs_radiation_danger", true)
     *      hud:GetCustomStatic("cs_radiation_danger"):wnd():TextControl():SetTextST("st_radiation_danger")
     *    end
     *  else
     *    const hud = get_hud()
     *    const custom_static = hud:GetCustomStatic("cs_radiation_danger")
     *    if custom_static !== null then
     *      hud:RemoveCustomStatic("cs_radiation_danger")
     *    end
     *  end
     */

    if (this.bCheckStart) {
      log.info("Set default infos");

      if (!hasAlifeInfo("global_dialogs")) {
        this.object.give_info_portion("global_dialogs");
      }

      if (!hasAlifeInfo("level_changer_icons")) {
        this.object.give_info_portion("level_changer_icons");
      }

      this.bCheckStart = false;
    }

    if (!this.loaded_slot_applied) {
      this.object.activate_slot(this.loaded_active_slot);
      this.loaded_slot_applied = true;
    }

    get_global("xr_s").on_actor_update(delta);

    /**
     *
     */

    if (this.surge_manager) {
      if (this.f_surge_manager_loaded !== true) {
        this.surge_manager.initialize();
        this.f_surge_manager_loaded = true;
      }

      if (this.surge_manager.levels_respawn[level.name()]) {
        this.surge_manager.respawnArtefactsAndReplaceAnomalyZones();
      }

      this.surge_manager.update();
    }

    get_sim_obj_registry().update_avaliability(alife().actor());

    if (!this.loaded) {
      // get_console().execute("dump_infos")
      this.loaded = true;
    }

    getTreasureManager().update();

    mapDisplayManager.update();
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "ActorBinder");

    object_binder.save(this, packet);

    packet.w_u8(level.get_game_difficulty());

    if (this.st.disable_input_time == null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeCTimeToPacket(packet, this.st.disable_input_time);
    }

    get_global<AnyCallablesModule>("xr_logic").pstor_save_all(this.object, packet);
    this.weather_manager.save(packet);
    get_global<AnyCallablesModule>("release_body_manager").get_release_body_manager().save(packet);
    this.surge_manager.save(packet);
    get_global<AnyCallablesModule>("sr_psy_antenna").save(packet);
    packet.w_bool(get_sim_board().simulation_started);

    get_global<AnyCallablesModule>("xr_sound").actor_save(packet);
    packet.w_stringZ(tostring(this.last_level_name));
    get_global<AnyCallablesModule>("xr_statistic").save(packet);
    getTreasureManager().save(packet);

    const n = getTableSize(scriptIds);

    packet.w_u8(n);

    for (const [k, v] of scriptIds) {
      packet.w_u16(k);
      packet.w_stringZ(v);
    }

    get_global("task_manager").get_task_manager().save(packet);

    packet.w_u8(this.object.active_slot());

    let deimos_exist = false;

    for (const [k, v] of zoneByName) {
      if (storage.get(v.id()) && storage.get(v.id()).active_section === "sr_deimos") {
        deimos_exist = true;
        packet.w_bool(true);
        packet.w_float(storage.get(v.id()).sr_deimos.intensity);
      }
    }

    if (!deimos_exist) {
      packet.w_bool(false);
    }

    if (this.last_detective_achievement_spawn_time == null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeCTimeToPacket(packet, this.last_detective_achievement_spawn_time);
    }

    if (this.last_mutant_hunter_achievement_spawn_time == null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeCTimeToPacket(packet, this.last_mutant_hunter_achievement_spawn_time);
    }

    setSaveMarker(packet, true, "ActorBinder");
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "ActorBinder");

    object_binder.load(this, packet);

    const game_difficulty: number = packet.r_u8();

    get_console().execute("g_game_difficulty " + game_difficulties_by_number[game_difficulty]);

    const stored_input_time = packet.r_bool();

    if (stored_input_time === true) {
      this.st.disable_input_time = readCTimeFromPacket(packet);
    }

    get_global<AnyCallablesModule>("xr_logic").pstor_load_all(this.object, packet);
    this.weather_manager.load(packet);
    get_global("release_body_manager").get_release_body_manager().load(packet);

    this.surge_manager.load(packet);
    this.f_surge_manager_loaded = true;
    get_global<AnyCallablesModule>("sr_psy_antenna").load(packet);
    get_sim_board().simulation_started = packet.r_bool();

    get_global<AnyCallablesModule>("xr_sound").actor_load(packet);

    const n = packet.r_stringZ();

    if (n !== "nil") {
      this.last_level_name = n;
    }

    get_global<AnyCallablesModule>("xr_statistic").load(packet);

    getTreasureManager().load(packet);

    const count = packet.r_u8();

    for (const i of $range(1, count)) {
      scriptIds.set(packet.r_u16(), packet.r_stringZ());
    }

    get_global("task_manager").get_task_manager().load(packet);

    this.loaded_active_slot = packet.r_u8();
    this.loaded_slot_applied = false;

    const b = packet.r_bool();

    if (b) {
      this.deimos_intensity = packet.r_float();
    }

    let stored_achievement_time = packet.r_bool();

    if (stored_achievement_time == true) {
      this.last_detective_achievement_spawn_time = readCTimeFromPacket(packet);
    }

    stored_achievement_time = packet.r_bool();

    if (stored_achievement_time == true) {
      this.last_mutant_hunter_achievement_spawn_time = readCTimeFromPacket(packet);
    }

    setLoadMarker(packet, true, "ActorBinder");
  },
  check_detective_achievement(): void {
    if (!hasAlifeInfo("detective_achievement_gained")) {
      return;
    }

    if (this.last_detective_achievement_spawn_time == null) {
      this.last_detective_achievement_spawn_time = game.get_game_time();
    }

    if (game.get_game_time().diffSec(this.last_detective_achievement_spawn_time) > 43200) {
      spawn_achivement_items(detective_achievement_items, 4, "zat_a2_actor_treasure");
      get_global<AnyCallablesModule>("xr_effects").send_tip(getActor(), null, ["st_detective_news", "got_medicine"]);
      this.last_detective_achievement_spawn_time = game.get_game_time();
    }
  },
  check_mutant_hunter_achievement(): void {
    if (!hasAlifeInfo("mutant_hunter_achievement_gained")) {
      return;
    }

    if (this.last_mutant_hunter_achievement_spawn_time == null) {
      this.last_mutant_hunter_achievement_spawn_time = game.get_game_time();
    }

    if (game.get_game_time().diffSec(this.last_mutant_hunter_achievement_spawn_time) > 43200) {
      spawn_achivement_items(mutant_hunter_achievement_items, 5, "jup_b202_actor_treasure");
      get_global<AnyCallablesModule>("xr_effects").send_tip(getActor(), null, ["st_mutant_hunter_news", "got_ammo"]);
      this.last_mutant_hunter_achievement_spawn_time = game.get_game_time();
    }
  }
} as IActorBinder);

export function check_for_weapon_hide_by_zones(): boolean {
  for (const [k, v] of weapon_hide) {
    if (v === true) {
      return true;
    }
  }

  return false;
}

export function hide_weapon(zone_id: number): void {
  weapon_hide.set(zone_id, true);
}

export function restore_weapon(zone_id: number): void {
  weapon_hide.set(zone_id, false);
}

export function spawn_achivement_items(
  items_table: LuaTable<number, string>,
  count: number,
  inv_box_story_id: string
): void {
  log.info("Spawn achievement items");

  const inv_box = alife().object(getStoryObjectId(inv_box_story_id)!)!;

  for (const i of $range(1, count)) {
    alife().create(
      items_table.get(math.random(items_table.length())),
      inv_box.position,
      inv_box.m_level_vertex_id,
      inv_box.m_game_vertex_id,
      inv_box.id
    );
  }
}

export function set_travel_func(func: Optional<AnyCallable>): void {
  travel_func = func;
}
