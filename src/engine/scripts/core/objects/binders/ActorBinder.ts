import {
  actor_stats,
  alife,
  callback,
  device,
  game,
  level,
  LuabindClass,
  object_binder,
  task,
  TXR_game_difficulty,
  TXR_TaskState,
  vector,
  XR_CArtefact,
  XR_CGameTask,
  XR_cse_alife_creature_actor,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { console_commands } from "@/engine/lib/constants/console_commands";
import { game_difficulties_by_number } from "@/engine/lib/constants/game_difficulties";
import { info_portions } from "@/engine/lib/constants/info_portions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { TLevel } from "@/engine/lib/constants/levels";
import { STRINGIFIED_NIL } from "@/engine/lib/constants/words";
import { AnyCallablesModule, Optional, TDuration, TIndex, TName } from "@/engine/lib/types";
import { IRegistryObjectState, registry, resetObject } from "@/engine/scripts/core/database";
import { registerActor, unregisterActor } from "@/engine/scripts/core/database/actor";
import { pstor_load_all, pstor_save_all } from "@/engine/scripts/core/database/pstor";
import { SimulationBoardManager } from "@/engine/scripts/core/database/SimulationBoardManager";
import { getSimulationObjectsRegistry } from "@/engine/scripts/core/database/SimulationObjectsRegistry";
import { AchievementsManager } from "@/engine/scripts/core/managers/achievements";
import { DropManager } from "@/engine/scripts/core/managers/DropManager";
import { EGameEvent } from "@/engine/scripts/core/managers/events/EGameEvent";
import { EventsManager } from "@/engine/scripts/core/managers/events/EventsManager";
import { GlobalSoundManager } from "@/engine/scripts/core/managers/GlobalSoundManager";
import { MapDisplayManager } from "@/engine/scripts/core/managers/map/MapDisplayManager";
import { NotificationManager } from "@/engine/scripts/core/managers/notifications/NotificationManager";
import { PsyAntennaManager } from "@/engine/scripts/core/managers/PsyAntennaManager";
import { ReleaseBodyManager } from "@/engine/scripts/core/managers/ReleaseBodyManager";
import { StatisticsManager } from "@/engine/scripts/core/managers/StatisticsManager";
import { SurgeManager } from "@/engine/scripts/core/managers/SurgeManager";
import { ETaskState } from "@/engine/scripts/core/managers/tasks";
import { TaskManager } from "@/engine/scripts/core/managers/tasks/TaskManager";
import { TravelManager } from "@/engine/scripts/core/managers/TravelManager";
import { TreasureManager } from "@/engine/scripts/core/managers/TreasureManager";
import { WeatherManager } from "@/engine/scripts/core/managers/WeatherManager";
import { Actor } from "@/engine/scripts/core/objects/alife/Actor";
import { AnomalyZoneBinder } from "@/engine/scripts/core/objects/binders/AnomalyZoneBinder";
import { ISchemeDeimosState } from "@/engine/scripts/core/schemes/sr_deimos";
import { SchemeDeimos } from "@/engine/scripts/core/schemes/sr_deimos/SchemeDeimos";
import { SchemeNoWeapon } from "@/engine/scripts/core/schemes/sr_no_weapon";
import { DynamicMusicManager } from "@/engine/scripts/core/sounds/DynamicMusicManager";
import { isArtefact } from "@/engine/scripts/utils/check/is";
import { executeConsoleCommand } from "@/engine/scripts/utils/console";
import { setLoadMarker, setSaveMarker } from "@/engine/scripts/utils/game_save";
import { hasAlifeInfo } from "@/engine/scripts/utils/info_portion";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { getTableSize } from "@/engine/scripts/utils/table";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/scripts/utils/time";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActorBinder extends object_binder {
  public readonly achievementsManager: AchievementsManager = AchievementsManager.getInstance();
  public readonly dropManager: DropManager = DropManager.getInstance(false);
  public readonly eventsManager: EventsManager = EventsManager.getInstance();
  public readonly globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();
  public readonly mapDisplayManager: MapDisplayManager = MapDisplayManager.getInstance();
  public readonly newsManager: NotificationManager = NotificationManager.getInstance();
  public readonly releaseBodyManager: ReleaseBodyManager = ReleaseBodyManager.getInstance();
  public readonly surgeManager: SurgeManager = SurgeManager.getInstance();
  public readonly taskManager: TaskManager = TaskManager.getInstance();
  public readonly travelManager: TravelManager = TravelManager.getInstance();
  public readonly treasureManager: TreasureManager = TreasureManager.getInstance();
  public readonly weatherManager: WeatherManager = WeatherManager.getInstance();

  public isStartCheckNeeded: boolean = false;
  public isLoaded: boolean = false;
  public isLoadedSlotApplied: boolean = false;

  public isWeaponHidden: boolean = false;
  public isWeaponHiddenInDialog: boolean = false;

  public spawnFrame: TIndex = 0;
  public activeItemSlot: TIndex = 3;
  public lastLevelName: Optional<TName> = null;
  public deimos_intensity: Optional<number> = null;

  public state!: IRegistryObjectState;

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
    logger.info("Construct actor binder:", object.name());
  }

  /**
   * todo;
   */
  public override net_spawn(data: XR_cse_alife_creature_actor): boolean {
    logger.info("Net spawn:", data.name());

    level.show_indicators();

    this.isStartCheckNeeded = true;
    this.isWeaponHidden = false;
    this.isWeaponHiddenInDialog = false;

    if (!super.net_spawn(data)) {
      return false;
    }

    registerActor(this.object);

    (registry.actor as unknown as ActorBinder).deimos_intensity = this.deimos_intensity;

    this.deimos_intensity = null;

    if (this.state.disable_input_time === null) {
      level.enable_input();
    }

    // todo: If needed
    if (this.state.pstor === null) {
      this.state.pstor = new LuaTable();
    }

    this.weatherManager.reset();
    this.dropManager.initialize();

    this.spawnFrame = device().frame;
    this.isLoaded = false;

    this.eventsManager.emitEvent(EGameEvent.ACTOR_NET_SPAWN);

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    GlobalSoundManager.getInstance().stopSoundsByObjectId(this.object.id());

    const board_factions = SimulationBoardManager.getInstance().players;

    if (board_factions !== null) {
      for (const [k, v] of board_factions) {
        GlobalSoundManager.getInstance().stopSoundsByObjectId(v.id);
      }
    }

    if (actor_stats.remove_from_ranking !== null) {
      actor_stats.remove_from_ranking(this.object.id());
    }

    level.show_weapon(true);
    unregisterActor();

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
      executeConsoleCommand(console_commands.snd_volume_eff, tostring(registry.sounds.effectsVolume));
      registry.sounds.effectsVolume = 0;
    }

    if (registry.sounds.musicVolume !== 0) {
      executeConsoleCommand(console_commands.snd_volume_music, tostring(registry.sounds.musicVolume));
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

    this.state = resetObject(this.object);
    this.state.pstor = null!;

    this.object.set_callback(callback.inventory_info, this.onInfoUpdate, this);
    this.object.set_callback(callback.on_item_take, this.onItemTake, this);
    this.object.set_callback(callback.on_item_drop, this.onItemDrop, this);
    this.object.set_callback(callback.trade_sell_buy_item, this.onTrade, this);
    this.object.set_callback(callback.task_state, this.onTaskUpdate, this);
    this.object.set_callback(callback.take_item_from_box, this.onTakeItemFromBox, this);
    this.object.set_callback(callback.use_object, this.onUseInventoryItem, this);
  }

  /**
   * todo;
   */
  public onTakeItemFromBox(box: XR_game_object, item: XR_game_object): void {
    logger.info("Take item from box:", box.name(), item.name());
  }

  /**
   * todo;
   */
  public onInfoUpdate(object: XR_game_object, info: string): void {
    logger.info("Info update:", info);
  }

  /**
   * todo;
   */
  public onTrade(item: XR_game_object, sell_bye: boolean, money: number): void {}

  /**
   * todo;
   */
  public onItemTake(object: XR_game_object): void {
    logger.info("On item take:", object.name());

    if (isArtefact(object)) {
      const anomalyZone: Optional<AnomalyZoneBinder> = registry.artefacts.parentZones.get(object.id());

      if (anomalyZone !== null) {
        anomalyZone.onArtefactTaken(object);
      } else {
        registry.artefacts.ways.delete(object.id());
      }

      const artefact: XR_CArtefact = object.get_artefact();

      artefact.FollowByPath("NULL", 0, new vector().set(500, 500, 500));

      StatisticsManager.getInstance().incrementCollectedArtefactsCount(object);
    }

    this.treasureManager.on_item_take(object.id());
  }

  /**
   * todo;
   */
  public onItemDrop(object: XR_game_object): void {}

  /**
   * todo;
   */
  public onUseInventoryItem(object: Optional<XR_game_object>): void {
    if (object === null) {
      return;
    }

    const serverObject: Optional<XR_cse_alife_object> = alife().object(object.id());
    const serverItemSection: Optional<TInventoryItem> = serverObject?.section_name() as Optional<TInventoryItem>;

    if (serverItemSection === drugs.drug_anabiotic) {
      this.surgeManager.processAnabioticItemUsage();
    }
  }

  /**
   * todo;
   */
  public onTaskUpdate(task_object: XR_CGameTask, state: TXR_TaskState): void {
    if (state !== task.fail) {
      this.newsManager.sendTaskNotification(
        registry.actor,
        state === task.completed ? ETaskState.COMPLETE : ETaskState.NEW,
        task_object
      );
    }

    get_global<AnyCallablesModule>("engine").task_callback(task_object, state);
  }

  /**
   * todo;
   */
  public override update(delta: TDuration): void {
    super.update(delta);

    // Handle input disabling.
    if (this.travelManager.isTraveling) {
      this.travelManager.onActiveTravelUpdate();
    }

    this.weatherManager.update();
    this.achievementsManager.update(delta);
    this.globalSoundManager.updateForObjectId(this.object.id());

    // Handle input disabling.
    if (
      this.state.disable_input_time !== null &&
      game.get_game_time().diffSec(this.state.disable_input_time) >= (this.state.disable_input_idle as number)
    ) {
      level.enable_input();
      this.state.disable_input_time = null;
    }

    if (this.object.is_talking()) {
      if (!this.isWeaponHiddenInDialog) {
        logger.info("Hiding weapon in dialog");
        this.object.hide_weapon();
        this.isWeaponHiddenInDialog = true;
      }
    } else {
      if (this.isWeaponHiddenInDialog) {
        logger.info("Restoring weapon in dialog");
        this.object.restore_weapon();
        this.isWeaponHiddenInDialog = false;
      }
    }

    if (SchemeNoWeapon.isInWeaponRestrictionZone()) {
      if (!this.isWeaponHidden) {
        logger.info("Hiding weapon");
        this.object.hide_weapon();
        this.isWeaponHidden = true;
      }
    } else {
      if (this.isWeaponHidden) {
        logger.info("Restoring weapon");
        this.object.restore_weapon();
        this.isWeaponHidden = false;
      }
    }

    PsyAntennaManager.getWeakInstance()?.update(delta);

    if (this.isStartCheckNeeded) {
      if (!hasAlifeInfo(info_portions.global_dialogs)) {
        this.object.give_info_portion(info_portions.global_dialogs);
      }

      if (!hasAlifeInfo(info_portions.level_changer_icons)) {
        this.object.give_info_portion(info_portions.level_changer_icons);
      }

      this.isStartCheckNeeded = false;
    }

    if (!this.isLoadedSlotApplied) {
      this.object.activate_slot(this.activeItemSlot);
      this.isLoadedSlotApplied = true;
    }

    this.eventsManager.emitEvent(EGameEvent.ACTOR_UPDATE, delta);

    if (this.surgeManager.levels_respawn[level.name() as TLevel]) {
      this.surgeManager.respawnArtefactsAndReplaceAnomalyZones();
    }

    this.surgeManager.update();

    getSimulationObjectsRegistry().update_avaliability(alife().actor() as Actor);

    this.treasureManager.update();
    this.mapDisplayManager.update();

    if (!this.isLoaded) {
      this.isLoaded = true;
    }
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, ActorBinder.__name);

    super.save(packet);

    packet.w_u8(level.get_game_difficulty());

    if (this.state.disable_input_time === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeCTimeToPacket(packet, this.state.disable_input_time);
    }

    pstor_save_all(this.object, packet);
    this.weatherManager.save(packet);
    this.releaseBodyManager.save(packet);
    this.surgeManager.save(packet);
    PsyAntennaManager.save(packet);
    packet.w_bool(SimulationBoardManager.getInstance().simulation_started);

    this.globalSoundManager.saveActor(packet);
    packet.w_stringZ(tostring(this.lastLevelName));
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
        packet.w_float((registry.objects.get(v.id())[SchemeDeimos.SCHEME_SECTION] as ISchemeDeimosState).intensity);
      }
    }

    if (!deimos_exist) {
      packet.w_bool(false);
    }

    this.achievementsManager.save(packet);

    setSaveMarker(packet, true, ActorBinder.__name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, ActorBinder.__name);

    super.load(reader);

    const gameDifficulty: TXR_game_difficulty = reader.r_u8() as TXR_game_difficulty;

    executeConsoleCommand(console_commands.g_game_difficulty, game_difficulties_by_number[gameDifficulty]);

    const storedInputTime = reader.r_bool();

    if (storedInputTime) {
      this.state.disable_input_time = readCTimeFromPacket(reader);
    }

    pstor_load_all(this.object, reader);
    this.weatherManager.load(reader);
    this.releaseBodyManager.load(reader);

    this.surgeManager.load(reader);
    PsyAntennaManager.load(reader);
    SimulationBoardManager.getInstance().simulation_started = reader.r_bool();

    this.globalSoundManager.loadActor(reader);

    const n = reader.r_stringZ();

    if (n !== STRINGIFIED_NIL) {
      this.lastLevelName = n;
    }

    StatisticsManager.getInstance().load(reader);

    this.treasureManager.load(reader);

    const count = reader.r_u8();

    for (const it of $range(1, count)) {
      registry.scriptSpawned.set(reader.r_u16(), reader.r_stringZ());
    }

    this.taskManager.load(reader);

    this.activeItemSlot = reader.r_u8();
    this.isLoadedSlotApplied = false;

    const hasDeimos: boolean = reader.r_bool();

    if (hasDeimos) {
      this.deimos_intensity = reader.r_float();
    }

    this.achievementsManager.load(reader);

    setLoadMarker(reader, true, ActorBinder.__name);
  }
}
