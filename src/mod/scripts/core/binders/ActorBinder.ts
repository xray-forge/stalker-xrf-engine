import {
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
  TXR_TaskState,
  vector,
  XR_CGameTask,
  XR_cse_alife_creature_actor,
  XR_game_object,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { animations } from "@/mod/globals/animation/animations";
import { post_processors } from "@/mod/globals/animation/post_processors";
import { game_difficulties_by_number } from "@/mod/globals/game_difficulties";
import { info_portions } from "@/mod/globals/info_portions";
import { ammo } from "@/mod/globals/items/ammo";
import { drugs } from "@/mod/globals/items/drugs";
import { TLevel } from "@/mod/globals/levels";
import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { Actor } from "@/mod/scripts/core/alife/Actor";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { addActor, deleteActor } from "@/mod/scripts/core/database/actor";
import { pstor_load_all, pstor_save_all } from "@/mod/scripts/core/database/pstor";
import { get_sim_board } from "@/mod/scripts/core/database/SimBoard";
import { get_sim_obj_registry } from "@/mod/scripts/core/database/SimObjectsRegistry";
import { DropManager } from "@/mod/scripts/core/managers/DropManager";
import { EGameEvent } from "@/mod/scripts/core/managers/events/EGameEvent";
import { EventsManager } from "@/mod/scripts/core/managers/events/EventsManager";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { mapDisplayManager } from "@/mod/scripts/core/managers/MapDisplayManager";
import { NotificationManager } from "@/mod/scripts/core/managers/notifications/NotificationManager";
import { PsyAntennaManager } from "@/mod/scripts/core/managers/PsyAntennaManager";
import { ReleaseBodyManager } from "@/mod/scripts/core/managers/ReleaseBodyManager";
import { StatisticsManager } from "@/mod/scripts/core/managers/StatisticsManager";
import { SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { ETaskState } from "@/mod/scripts/core/managers/tasks";
import { TaskManager } from "@/mod/scripts/core/managers/tasks/TaskManager";
import { TravelManager } from "@/mod/scripts/core/managers/TravelManager";
import { TreasureManager } from "@/mod/scripts/core/managers/TreasureManager";
import { WeatherManager } from "@/mod/scripts/core/managers/WeatherManager";
import { SchemeDeimos } from "@/mod/scripts/core/schemes/sr_deimos/SchemeDeimos";
import { DynamicMusicManager } from "@/mod/scripts/core/sound/DynamicMusicManager";
import { isArtefact } from "@/mod/scripts/utils/checkers/is";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/info_portions";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getTableSize } from "@/mod/scripts/utils/table";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

let weapon_hide: LuaTable<number, boolean> = new LuaTable();

const logger: LuaLogger = new LuaLogger("ActorBinder");

const detective_achievement_items: LuaTable<number, string> = [drugs.medkit, drugs.antirad, drugs.antirad] as any;

const mutant_hunter_achievement_items: LuaTable<number, string> = [
  ammo["ammo_5.45x39_ap"],
  ammo["ammo_5.56x45_ap"],
  ammo.ammo_9x39_ap,
  ammo["ammo_5.56x45_ap"],
  ammo.ammo_12x76_zhekan,
] as any;

/**
 * todo;
 */
@LuabindClass()
export class ActorBinder extends object_binder {
  public bCheckStart: boolean = false;
  public isSurgeManagerLoaded: boolean = false;

  public readonly taskManager: TaskManager = TaskManager.getInstance();
  public readonly dropManager: DropManager = DropManager.getInstance(false);
  public readonly eventsManager: EventsManager = EventsManager.getInstance();
  public readonly surgeManager: SurgeManager = SurgeManager.getInstance(false);
  public readonly treasureManager: TreasureManager = TreasureManager.getInstance();
  public readonly weatherManager: WeatherManager = WeatherManager.getInstance();
  public readonly releaseBodyManager: ReleaseBodyManager = ReleaseBodyManager.getInstance();
  public readonly travelManager: TravelManager = TravelManager.getInstance();
  public readonly newsManager: NotificationManager = NotificationManager.getInstance();
  public readonly globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

  public loaded: boolean = false;
  public spawn_frame: number = 0;

  public last_level_name: Optional<string> = null;
  public deimos_intensity: Optional<number> = null;
  public loaded_active_slot: number = 3;
  public loaded_slot_applied: boolean = false;

  public weapon_hide: boolean = false;
  public weapon_hide_in_dialog: boolean = false;

  public last_detective_achievement_spawn_time: Optional<any> = null;
  public last_mutant_hunter_achievement_spawn_time: Optional<any> = null;

  public st!: IStoredObject;

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);

    logger.info("Init new actor binder:", object.name());
  }

  /**
   * todo;
   */
  public override net_spawn(data: XR_cse_alife_creature_actor): boolean {
    logger.info("Net spawn:", data.name());

    level.show_indicators();

    this.bCheckStart = true;
    this.weapon_hide = false;
    this.weapon_hide_in_dialog = false;

    weapon_hide = new LuaTable();

    if (!super.net_spawn(data)) {
      return false;
    }

    addActor(this.object);

    (registry.actor as unknown as ActorBinder).deimos_intensity = this.deimos_intensity;

    this.deimos_intensity = null;

    if (this.st.disable_input_time === null) {
      level.enable_input();
    }

    // todo: If needed
    if (this.st.pstor === null) {
      this.st.pstor = new LuaTable();
    }

    this.weatherManager.reset();
    this.dropManager.initialize();

    this.spawn_frame = device().frame;
    this.loaded = false;

    this.eventsManager.emitEvent(EGameEvent.ACTOR_NET_SPAWN);

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    GlobalSoundManager.getInstance().stopSoundsByObjectId(this.object.id());

    const board_factions = get_sim_board().players;

    if (board_factions !== null) {
      for (const [k, v] of board_factions) {
        GlobalSoundManager.getInstance().stopSoundsByObjectId(v.id);
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

    if (registry.sounds.effectsVolume !== 0) {
      get_console().execute("snd_volume_eff " + tostring(registry.sounds.effectsVolume));
      registry.sounds.effectsVolume = 0;
    }

    if (registry.sounds.musicVolume !== 0) {
      get_console().execute("snd_volume_music " + tostring(registry.sounds.musicVolume));
      registry.sounds.musicVolume = 0;
    }

    PsyAntennaManager.dispose();

    DynamicMusicManager.getInstance().stopTheme();

    this.eventsManager.emitEvent(EGameEvent.ACTOR_NET_DESTROY);

    super.net_destroy();
  }

  /**
   * todo;
   */
  public override reinit(): void {
    super.reinit();

    const npc_id = this.object.id();

    registry.objects.set(npc_id, {});

    this.st = registry.objects.get(npc_id);
    this.st.pstor = null!;

    this.object.set_callback(callback.inventory_info, this.info_callback, this);
    this.object.set_callback(callback.on_item_take, this.on_item_take, this);
    this.object.set_callback(callback.on_item_drop, this.on_item_drop, this);
    this.object.set_callback(callback.trade_sell_buy_item, this.on_trade, this);
    this.object.set_callback(callback.task_state, this.task_callback, this);
    this.object.set_callback(callback.take_item_from_box, this.take_item_from_box, this);
    this.object.set_callback(callback.use_object, this.use_inventory_item, this);
  }

  /**
   * todo;
   */
  public take_item_from_box(box: XR_game_object, item: XR_game_object): void {
    logger.info("Take item from box:", box.name(), item.name());
  }

  /**
   * todo;
   */
  public info_callback(npc: XR_game_object, info_id: string): void {
    logger.info("[info callback]");
  }

  /**
   * todo;
   */
  public on_trade(item: XR_game_object, sell_bye: boolean, money: number): void {}

  /**
   * todo;
   */
  public article_callback(): void {}

  /**
   * todo;
   */
  public on_item_take(object: XR_game_object): void {
    logger.info("On item take:", object.name());

    if (isArtefact(object)) {
      const anomal_zone = registry.artefacts.parentZones.get(object.id());

      if (anomal_zone !== null) {
        anomal_zone.onArtefactTaken(object);
      } else {
        registry.artefacts.ways.delete(object.id());
      }

      const artefact = object.get_artefact();

      artefact.FollowByPath("NULL", 0, new vector().set(500, 500, 500));

      StatisticsManager.getInstance().incrementCollectedArtefactsCount(object);
    }

    this.treasureManager.on_item_take(object.id());
  }

  /**
   * todo;
   */
  public on_item_drop(object: XR_game_object): void {}

  /**
   * todo;
   */
  public use_inventory_item(obj: XR_game_object): void {
    if (obj !== null) {
      const s_obj = alife().object(obj.id());

      if (s_obj && s_obj.section_name() === "drug_anabiotic") {
        get_global<AnyCallablesModule>("xr_effects").disable_ui_only(registry.actor, null);

        level.add_cam_effector(animations.camera_effects_surge_02, 10, false, "extern.anabiotic_callback");
        level.add_pp_effector(post_processors.surge_fade, 11, false);

        giveInfo(info_portions.anabiotic_in_process);

        registry.sounds.musicVolume = get_console().get_float("snd_volume_music");
        registry.sounds.effectsVolume = get_console().get_float("snd_volume_eff");

        get_console().execute("snd_volume_music 0");
        get_console().execute("snd_volume_eff 0");
      }
    }
  }

  /**
   * todo;
   */
  public task_callback(task_object: XR_CGameTask, state: TXR_TaskState): void {
    if (state !== task.fail) {
      this.newsManager.sendTaskNotification(
        registry.actor,
        state === task.completed ? ETaskState.COMPLETE : ETaskState.NEW,
        task_object
      );
    }

    get_global<AnyCallablesModule>("extern").task_callback(task_object, state);
  }

  /**
   * todo;
   */
  public override update(delta: number): void {
    super.update(delta);

    if (this.travelManager.isTraveling) {
      this.travelManager.onActiveTravelUpdate();
    }

    this.weatherManager.update();

    this.check_detective_achievement();
    this.check_mutant_hunter_achievement();

    this.globalSoundManager.updateForObjectId(this.object.id());

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
        logger.info("Hiding weapon in dialog");
        this.weapon_hide_in_dialog = true;
      }
    } else {
      if (this.weapon_hide_in_dialog === true) {
        logger.info("Restoring weapon in dialog");
        this.object.restore_weapon();
        this.weapon_hide_in_dialog = false;
      }
    }

    if (check_for_weapon_hide_by_zones() === true) {
      if (this.weapon_hide === false) {
        logger.info("Hiding weapon");
        this.object.hide_weapon();
        this.weapon_hide = true;
      }
    } else {
      if (this.weapon_hide === true) {
        logger.info("Restoring weapon");
        this.object.restore_weapon();
        this.weapon_hide = false;
      }
    }

    PsyAntennaManager.getWeakInstance()?.update(delta);

    /**
     * todo: Not implemented originally.
     *
     *  if this.object.radiation >= 0.7 then
     *    const hud = get_hud()
     *    const custom_static = hud:GetCustomStatic("cs_radiation_danger")
     *    if custom_static === null then
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
      logger.info("Set default infos");

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

    this.eventsManager.emitEvent(EGameEvent.ACTOR_UPDATE, delta);

    if (!this.isSurgeManagerLoaded) {
      this.surgeManager.initialize();
      this.isSurgeManagerLoaded = true;
    }

    if (this.surgeManager.levels_respawn[level.name() as TLevel]) {
      this.surgeManager.respawnArtefactsAndReplaceAnomalyZones();
    }

    this.surgeManager.update();

    get_sim_obj_registry().update_avaliability(alife().actor() as Actor);

    if (!this.loaded) {
      // get_console().execute("dump_infos")
      this.loaded = true;
    }

    this.treasureManager.update();

    mapDisplayManager.update();
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, ActorBinder.__name);

    super.save(packet);

    packet.w_u8(level.get_game_difficulty());

    if (this.st.disable_input_time === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeCTimeToPacket(packet, this.st.disable_input_time);
    }

    pstor_save_all(this.object, packet);
    this.weatherManager.save(packet);
    this.releaseBodyManager.save(packet);
    this.surgeManager.save(packet);
    PsyAntennaManager.save(packet);
    packet.w_bool(get_sim_board().simulation_started);

    this.globalSoundManager.saveActor(packet);
    packet.w_stringZ(tostring(this.last_level_name));
    StatisticsManager.getInstance().save(packet);
    this.treasureManager.save(packet);

    const n = getTableSize(registry.scriptSpawned);

    packet.w_u8(n);

    for (const [k, v] of registry.scriptSpawned) {
      packet.w_u16(k);
      packet.w_stringZ(v);
    }

    this.taskManager.save(packet);

    packet.w_u8(this.object.active_slot());

    let deimos_exist = false;

    for (const [k, v] of registry.zones) {
      if (registry.objects.get(v.id()) && registry.objects.get(v.id()).active_section === SchemeDeimos.SCHEME_SECTION) {
        deimos_exist = true;
        packet.w_bool(true);
        packet.w_float(registry.objects.get(v.id())[SchemeDeimos.SCHEME_SECTION].intensity);
      }
    }

    if (!deimos_exist) {
      packet.w_bool(false);
    }

    if (this.last_detective_achievement_spawn_time === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeCTimeToPacket(packet, this.last_detective_achievement_spawn_time);
    }

    if (this.last_mutant_hunter_achievement_spawn_time === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeCTimeToPacket(packet, this.last_mutant_hunter_achievement_spawn_time);
    }

    setSaveMarker(packet, true, ActorBinder.__name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, ActorBinder.__name);

    super.load(reader);

    const game_difficulty: number = reader.r_u8();

    get_console().execute("g_game_difficulty " + game_difficulties_by_number[game_difficulty]);

    const stored_input_time = reader.r_bool();

    if (stored_input_time) {
      this.st.disable_input_time = readCTimeFromPacket(reader);
    }

    pstor_load_all(this.object, reader);
    this.weatherManager.load(reader);
    this.releaseBodyManager.load(reader);

    this.surgeManager.load(reader);
    this.isSurgeManagerLoaded = true;
    PsyAntennaManager.load(reader);
    get_sim_board().simulation_started = reader.r_bool();

    this.globalSoundManager.loadActor(reader);

    const n = reader.r_stringZ();

    if (n !== STRINGIFIED_NIL) {
      this.last_level_name = n;
    }

    StatisticsManager.getInstance().load(reader);

    this.treasureManager.load(reader);

    const count = reader.r_u8();

    for (const it of $range(1, count)) {
      registry.scriptSpawned.set(reader.r_u16(), reader.r_stringZ());
    }

    this.taskManager.load(reader);

    this.loaded_active_slot = reader.r_u8();
    this.loaded_slot_applied = false;

    const b = reader.r_bool();

    if (b) {
      this.deimos_intensity = reader.r_float();
    }

    let stored_achievement_time = reader.r_bool();

    if (stored_achievement_time) {
      this.last_detective_achievement_spawn_time = readCTimeFromPacket(reader);
    }

    stored_achievement_time = reader.r_bool();

    if (stored_achievement_time) {
      this.last_mutant_hunter_achievement_spawn_time = readCTimeFromPacket(reader);
    }

    setLoadMarker(reader, true, ActorBinder.__name);
  }

  /**
   * todo;
   */
  public check_detective_achievement(): void {
    if (!hasAlifeInfo(info_portions.detective_achievement_gained)) {
      return;
    }

    if (this.last_detective_achievement_spawn_time === null) {
      this.last_detective_achievement_spawn_time = game.get_game_time();
    }

    if (game.get_game_time().diffSec(this.last_detective_achievement_spawn_time) > 43200) {
      spawn_achivement_items(detective_achievement_items, 4, "zat_a2_actor_treasure");
      get_global<AnyCallablesModule>("xr_effects").send_tip(registry.actor, null, [
        "st_detective_news",
        "got_medicine",
      ]);
      this.last_detective_achievement_spawn_time = game.get_game_time();
    }
  }

  /**
   * todo;
   */
  public check_mutant_hunter_achievement(): void {
    if (!hasAlifeInfo(info_portions.mutant_hunter_achievement_gained)) {
      return;
    }

    if (this.last_mutant_hunter_achievement_spawn_time === null) {
      this.last_mutant_hunter_achievement_spawn_time = game.get_game_time();
    }

    if (game.get_game_time().diffSec(this.last_mutant_hunter_achievement_spawn_time) > 43200) {
      spawn_achivement_items(mutant_hunter_achievement_items, 5, "jup_b202_actor_treasure");
      get_global<AnyCallablesModule>("xr_effects").send_tip(registry.actor, null, [
        "st_mutant_hunter_news",
        "got_ammo",
      ]);
      this.last_mutant_hunter_achievement_spawn_time = game.get_game_time();
    }
  }
}

/**
 * todo;
 */
export function check_for_weapon_hide_by_zones(): boolean {
  for (const [k, v] of weapon_hide) {
    if (v === true) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function hide_weapon(zone_id: number): void {
  weapon_hide.set(zone_id, true);
}

/**
 * todo;
 */
export function restore_weapon(zone_id: number): void {
  weapon_hide.set(zone_id, false);
}

/**
 * todo;
 */
export function spawn_achivement_items(
  items_table: LuaTable<number, string>,
  count: number,
  inv_box_story_id: string
): void {
  logger.info("Spawn achievement items");

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
