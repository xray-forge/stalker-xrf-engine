import {
  alife,
  device,
  game,
  get_console,
  hit,
  level,
  vector,
  XR_CTime,
  XR_game_object,
  XR_hit,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { registry, SURGE_MANAGER_LTX } from "@/engine/core/database";
import { pstor_retrieve, pstor_store } from "@/engine/core/database/portable_store";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import { notificationManagerIcons } from "@/engine/core/managers/notifications";
import { NotificationManager } from "@/engine/core/managers/notifications/NotificationManager";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { StatisticsManager } from "@/engine/core/managers/StatisticsManager";
import { WeatherManager } from "@/engine/core/managers/WeatherManager";
import { SmartTerrain } from "@/engine/core/objects";
import { Squad } from "@/engine/core/objects/alife/Squad";
import { isImmuneToSurge, isObjectOnLevel, isSurgeEnabledOnLevel } from "@/engine/core/utils/check/check";
import { isStoryObject } from "@/engine/core/utils/check/is";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { disableGameUiOnly } from "@/engine/core/utils/control";
import { createScenarioAutoSave, setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { copyTable } from "@/engine/core/utils/table";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/core/utils/time";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { animations } from "@/engine/lib/constants/animation/animations";
import { post_processors } from "@/engine/lib/constants/animation/post_processors";
import { captions } from "@/engine/lib/constants/captions";
import { console_commands } from "@/engine/lib/constants/console_commands";
import { info_portions } from "@/engine/lib/constants/info_portions";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { Optional, PartialRecord, TLabel, TNumberId } from "@/engine/lib/types";

export const surge_shock_pp_eff_id: TNumberId = 1;
export const earthquake_cam_eff_id: TNumberId = 2;
export const sleep_cam_eff_id: TNumberId = 3;
export const sleep_fade_pp_eff_id: TNumberId = 4;

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SurgeManager extends AbstractCoreManager {
  private static check_squad_smart_props(squadId: TNumberId): boolean {
    const squad: Optional<Squad> = alife().object(squadId);

    if (squad) {
      const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
      const smartTerrain: Optional<SmartTerrain> = squad.smart_id
        ? (simulationBoardManager.getSmartTerrainDescriptorById(squad.smart_id)?.smartTerrain as Optional<SmartTerrain>)
        : null;

      if (smartTerrain) {
        if (tonumber(smartTerrain.props["surge"])! <= 0) {
          return true;
        }
      }
    }

    return false; // -- can't delete squad in his smart if squad is in cover
  }

  public levels_respawn: PartialRecord<TLevel, boolean> = {
    [levels.zaton]: false,
    [levels.jupiter]: false,
    [levels.pripyat]: false,
  };

  public isStarted: boolean = false;
  public isFinished: boolean = true;
  public isTimeForwarded: boolean = false;
  public isEffectorSet: boolean = false;

  public skipMessage: boolean = false;
  public task_given: boolean = false;
  public second_message_given: boolean = false;
  public ui_disabled: boolean = false;
  public blowout_sound: boolean = false;

  public nextScheduledSurgeDelay: number = 0;
  public surgeCoversCount: number = 0;

  public prev_sec: number = 0;

  public initedTime!: XR_CTime;
  public lastSurgeTime!: XR_CTime;

  public covers: LuaTable<number, XR_game_object> = new LuaTable();
  public surgeManagerCondlist: TConditionList = new LuaTable();
  public surgeSurviveCondlist: TConditionList = new LuaTable();

  public isLoaded: boolean = false;
  public surge_message: string = "";
  public surge_task_sect: string = "";

  /**
   * todo: Description.
   */
  public override initialize(): void {
    this.isStarted = false;
    this.isFinished = true;
    this.isTimeForwarded = false;
    this.isEffectorSet = false;

    this.skipMessage = false;
    this.task_given = false;
    this.second_message_given = false;
    this.ui_disabled = false;
    this.blowout_sound = false;

    this.initedTime = game.CTime();
    this.lastSurgeTime = game.get_game_time();

    this.nextScheduledSurgeDelay = math.random(
      surgeConfig.INTERVAL_BETWEEN_SURGES.MIN_ON_FIRST_TIME,
      surgeConfig.INTERVAL_BETWEEN_SURGES.MAX_ON_FIRST_TIME
    );

    this.surgeCoversCount = 0;
    this.covers = new LuaTable();
    this.surgeManagerCondlist = new LuaTable();
    this.surgeSurviveCondlist = new LuaTable();

    let conditionString: string = TRUE;

    if (SURGE_MANAGER_LTX.line_exist("settings", "condlist")) {
      conditionString = SURGE_MANAGER_LTX.r_string("settings", "condlist");
    }

    this.surgeManagerCondlist = parseConditionsList(conditionString);

    conditionString = FALSE;

    if (SURGE_MANAGER_LTX.line_exist("settings", "survive")) {
      conditionString = SURGE_MANAGER_LTX.r_string("settings", "survive");
    }

    this.surgeSurviveCondlist = parseConditionsList(conditionString);

    this.initializeSurgeCovers();

    this.surge_message = "";
    this.surge_task_sect = "";
    this.isLoaded = false;
  }

  /**
   * todo: Description.
   */
  public initializeSurgeCovers(): void {
    for (const it of $range(0, SURGE_MANAGER_LTX.line_count("list") - 1)) {
      const [temp1, id, temp2] = SURGE_MANAGER_LTX.r_line("list", it, "", "");
      const zone: Optional<XR_game_object> = registry.zones.get(id);

      if (zone !== null) {
        this.surgeCoversCount += 1;
        this.covers.set(this.surgeCoversCount, zone);

        if (SURGE_MANAGER_LTX.line_exist(id, "condlist")) {
          (this.covers.get(this.surgeCoversCount) as any).condlist = parseConditionsList(
            SURGE_MANAGER_LTX.r_string(id, "condlist")
          );
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public getNearestAvailableCoverId(): Optional<TNumberId> {
    logger.info("Getting nearest cover");

    if (this.isLoaded) {
      this.initializeSurgeCovers();
    }

    const hides: LuaTable<number> = new LuaTable();

    copyTable(hides, this.covers);

    // Remove camps that are alarmed and actor is unable to enter
    if (this.surgeCoversCount > 0) {
      for (const [k, v] of hides) {
        if (v.condlist) {
          const sect: Optional<string> = pickSectionFromCondList(registry.actor, null, v.condlist);

          if (sect !== "true" && sect !== null) {
            table.remove(hides, k);
          }
        }
      }

      let nearest_cover_id = hides.get(1).id();
      let nearest_cover_dist = hides.get(1).position().distance_to(registry.actor.position());

      for (const [k, v] of hides) {
        if (registry.objects.get(v.id()).object!.inside(registry.actor.position())) {
          return v.id();
        }

        const dist = v.position().distance_to(registry.actor.position());

        if (dist < nearest_cover_dist) {
          if (v.condlist) {
            const sect: Optional<string> = pickSectionFromCondList(registry.actor, null, v.condlist);

            if (sect === "true") {
              nearest_cover_id = v.id();
              nearest_cover_dist = dist;
            }
          } else {
            nearest_cover_id = v.id();
            nearest_cover_dist = dist;
          }
        }
      }

      if (nearest_cover_id === hides.get(1).id()) {
        if (hides.get(1).condlist) {
          const sect = pickSectionFromCondList(registry.actor, null, hides.get(1).condlist);

          if (sect !== "true" && sect !== null) {
            return null;
          }
        }
      }

      return nearest_cover_id;
    } else {
      return null;
    }
  }

  /**
   * todo: Description.
   */
  public isActorInCover(): boolean {
    const coverObjectId: Optional<TNumberId> = this.getNearestAvailableCoverId();

    return coverObjectId !== null && registry.objects.get(coverObjectId).object.inside(registry.actor.position());
  }

  /**
   * todo
   */
  public setSkipResurrectMessage(): void {
    this.skipMessage = false;
  }

  /**
   * todo: Description.
   */
  public setSurgeTask(task: string): void {
    this.surge_task_sect = task;
  }

  /**
   * todo: Description.
   */
  public setSurgeMessage(message: TLabel): void {
    this.surge_message = message;
  }

  /**
   * todo: Description.
   */
  public getTaskTarget(): Optional<number> {
    if (this.isActorInCover()) {
      return null;
    }

    return this.getNearestAvailableCoverId();
  }

  /**
   * todo: Description.
   */
  public isKillingAll(): boolean {
    return this.isStarted && this.ui_disabled;
  }

  /**
   * todo: Description.
   */
  public requestSurgeStart(): void {
    logger.info("Request surge start");

    if (this.getNearestAvailableCoverId()) {
      this.start(true);
    } else {
      logger.info("Error: Surge covers are not set! Can't manually start");
    }
  }

  /**
   * todo: Description.
   */
  public requestSurgeStop(): void {
    logger.info("Request surge stop");

    if (this.isStarted) {
      this.endSurge(true);
    }
  }

  protected start(manual?: boolean): void {
    const [Y, M, D, h, m, s, ms] = this.lastSurgeTime.get(0, 0, 0, 0, 0, 0, 0);

    if (manual) {
      this.initedTime = game.get_game_time();
    } else {
      this.initedTime.set(Y, M, D, h, m, s + this.nextScheduledSurgeDelay, ms);
    }

    const diff_sec = math.ceil(game.get_game_time().diffSec(this.initedTime) / level.get_time_factor());

    if (!isSurgeEnabledOnLevel(level.name())) {
      this.skipMessage = true;
      this.skipSurge();

      return;
    }

    if (diff_sec + 6 > surgeConfig.DURATION) {
      this.skipSurge();
    } else {
      this.isStarted = true;
      this.isFinished = false;

      // -- autosave
      if (
        !hasAlifeInfo(info_portions.pri_b305_fifth_cam_end) ||
        hasAlifeInfo(info_portions.pri_a28_actor_in_zone_stay)
      ) {
        createScenarioAutoSave(captions.st_save_uni_surge_start);
      }
    }
  }

  /**
   * todo: Description.
   */
  public skipSurge(): void {
    logger.info("Skip surge");

    const [Y, M, D, h, m, s, ms] = this.initedTime.get(0, 0, 0, 0, 0, 0, 0);

    this.lastSurgeTime.set(Y, M, D, h, m, s + surgeConfig.DURATION, ms);

    this.isStarted = false;
    this.isFinished = true;
    this.levels_respawn = { zaton: true, jupiter: true, pripyat: true };
    this.nextScheduledSurgeDelay = math.random(
      surgeConfig.INTERVAL_BETWEEN_SURGES.MIN,
      surgeConfig.INTERVAL_BETWEEN_SURGES.MAX
    );
    this.surge_message = "";
    this.surge_task_sect = "";
    this.task_given = false;

    this.isEffectorSet = false;
    this.second_message_given = false;
    this.ui_disabled = false;
    this.blowout_sound = false;
    this.prev_sec = 0;

    this.respawnArtefactsAndReplaceAnomalyZones();
    StatisticsManager.getInstance().incrementSurgesCount();

    if (!this.skipMessage) {
      NotificationManager.getInstance().sendTipNotification(
        registry.actor,
        captions.st_surge_while_asleep,
        null,
        notificationManagerIcons.recent_surge,
        null,
        null
      );
      this.skipMessage = true;
    }
  }

  /**
   * todo: Description.
   */
  public endSurge(manual?: boolean): void {
    logger.info("Ending surge:", manual);

    this.isStarted = false;
    this.isFinished = true;
    this.levels_respawn = { zaton: true, jupiter: true, pripyat: true };
    this.lastSurgeTime = game.get_game_time();
    this.nextScheduledSurgeDelay = math.random(
      surgeConfig.INTERVAL_BETWEEN_SURGES.MIN,
      surgeConfig.INTERVAL_BETWEEN_SURGES.MAX
    );
    this.surge_message = "";
    this.surge_task_sect = "";
    this.task_given = false;

    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (this.isEffectorSet) {
      globalSoundManager.stopLoopedSound(registry.actor.id(), "blowout_rumble");
    }

    if (this.second_message_given) {
      globalSoundManager.stopLoopedSound(registry.actor.id(), "surge_earthquake_sound_looped");
    }

    level.remove_pp_effector(surge_shock_pp_eff_id);
    level.remove_cam_effector(earthquake_cam_eff_id);

    if (manual || (this.isTimeForwarded && WeatherManager.getInstance().weather_fx)) {
      level.stop_weather_fx();
      // --        WeatherManager.get_weather_manager():select_weather(true)
      WeatherManager.getInstance().forced_weather_change();
    }

    this.isEffectorSet = false;
    this.second_message_given = false;
    this.ui_disabled = false;
    this.blowout_sound = false;
    this.prev_sec = 0;

    for (const [k, v] of registry.signalLights) {
      logger.info("Stop signal light");
      v.stop_light();
      v.stop();
    }

    if (this.isLoaded) {
      this.kill_all_unhided();
    }

    this.respawnArtefactsAndReplaceAnomalyZones();
    StatisticsManager.getInstance().incrementSurgesCount();
  }

  /**
   * todo: Description.
   */
  public kill_all_unhided(): void {
    logger.info("Kill all surge unhided");

    const h: XR_hit = new hit();

    h.type = hit.fire_wound;
    h.power = 0.9;
    h.impulse = 0.0;
    h.direction = new vector().set(0, 0, 1);
    h.draftsman = registry.actor;

    logger.info("Kill crows");
    for (const [k, v] of registry.crows.storage) {
      const obj = alife().object(v);

      if (obj) {
        const crow = level.object_by_id(obj.id);

        if (crow && crow.alive()) {
          crow.hit(h);
        }
      }
    }

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const levelName: TLevel = level.name();

    logger.info("Releasing squads:", simulationBoardManager.getSquads().length());

    for (const [squadId, squad] of simulationBoardManager.getSquads()) {
      if (isObjectOnLevel(squad, levelName) && !isImmuneToSurge(squad) && !isStoryObject(squad)) {
        for (const member of squad.squad_members()) {
          if (!isStoryObject(member.object)) {
            if (SurgeManager.check_squad_smart_props(squad.id)) {
              logger.info("Releasing npc from squad because of surge:", member.object.name(), squad.name());

              const cl_obj = level.object_by_id(member.object.id);

              if (cl_obj !== null) {
                cl_obj.kill(cl_obj);
              } else {
                member.object.kill();
              }
            } else {
              let release = true;

              for (const it of $range(1, this.covers.length())) {
                const cover = this.covers.get(it);

                if (cover && cover.inside(member.object.position)) {
                  release = false;
                }
              }

              if (release) {
                logger.info("Releasing npc from squad because of surge:", member.object.name(), squad.name());

                const clientObject = level.object_by_id(member.object.id);

                if (clientObject !== null) {
                  clientObject.kill(clientObject);
                } else {
                  member.object.kill();
                }
              }
            }
          }
        }
      }
    }

    const cover = this.getNearestAvailableCoverId();

    if (registry.actor.alive()) {
      if (
        !(cover && registry.objects.get(cover) && registry.objects.get(cover).object!.inside(registry.actor.position()))
      ) {
        if (hasAlifeInfo(info_portions.anabiotic_in_process)) {
          const counter_name = "actor_marked_by_zone_cnt";
          const cnt_value: number = pstor_retrieve(registry.actor, counter_name, 0);

          pstor_store(registry.actor, counter_name, cnt_value + 1);
        }

        disableGameUiOnly(registry.actor);

        if (pickSectionFromCondList(registry.actor, null, this.surgeSurviveCondlist) !== TRUE) {
          this.kill_all_unhided_after_actor_death();
          registry.actor.kill(registry.actor);

          return;
        } else {
          level.add_cam_effector(animations.camera_effects_surge_02, sleep_cam_eff_id, false, "engine.surge_callback");
          level.add_pp_effector(post_processors.surge_fade, sleep_fade_pp_eff_id, false);
          registry.actor.health = registry.actor.health - 0.05;
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  protected kill_all_unhided_after_actor_death(): void {
    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const levelName: TLevel = level.name();

    for (const [squadId, squad] of simulationBoardManager.getSquads()) {
      if (isObjectOnLevel(squad, levelName) && !isImmuneToSurge(squad)) {
        for (const member of squad.squad_members()) {
          let isInCover: boolean = false;

          for (const it of $range(1, this.covers.length())) {
            const cover: Optional<XR_game_object> = this.covers.get(it);

            if (cover && cover.inside(member.object.position)) {
              isInCover = true;
              break;
            }
          }

          if (!isInCover) {
            logger.info(
              "Releasing npc from squad after actors death because of surge:",
              member.object.name(),
              squad.name()
            );

            const cl_obj: Optional<XR_game_object> = level.object_by_id(member.object.id);

            if (cl_obj !== null) {
              cl_obj.kill(cl_obj);
            } else {
              member.object.kill();
            }
          }
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public respawnArtefactsAndReplaceAnomalyZones(): void {
    const lvl_nm: TLevel = level.name();

    if (this.levels_respawn[lvl_nm]) {
      this.levels_respawn[lvl_nm] = false;
    }

    for (const [k, v] of registry.anomalies) {
      v.respawnArtefactsAndReplaceAnomalyZones();
    }

    MapDisplayManager.getInstance().updateAnomalyZonesDisplay();
  }

  /**
   * todo: Description.
   */
  public processAnabioticItemUsage(): void {
    disableGameUiOnly(registry.actor);

    level.add_cam_effector(animations.camera_effects_surge_02, 10, false, "engine.anabiotic_callback");
    level.add_pp_effector(post_processors.surge_fade, 11, false);

    giveInfo(info_portions.anabiotic_in_process);

    registry.sounds.musicVolume = get_console().get_float("snd_volume_music");
    registry.sounds.effectsVolume = get_console().get_float("snd_volume_eff");

    executeConsoleCommand(console_commands.snd_volume_music, 0);
    executeConsoleCommand(console_commands.snd_volume_eff, 0);
  }

  /**
   * todo: Description.
   */
  protected giveSurgeHideTask(): void {
    if (this.surge_task_sect !== "empty") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { get_task_manager } = require("@/engine/core/managers/tasks/TaskManager");

      if (this.surge_task_sect === "") {
        get_task_manager().give_task("hide_from_surge");
      } else {
        get_task_manager().give_task(this.surge_task_sect);
      }

      this.task_given = true;
    }
  }

  /**
   * todo: Description.
   */
  protected launch_rockets(): void {
    logger.info("Launch rockets");
    for (const [k, v] of registry.signalLights) {
      logger.info("Start signal light");
      if (!v.is_flying()) {
        v.launch();
      }
    }
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    if (device().precache_frame > 1) {
      return;
    }

    if (!this.isStarted) {
      const currentGameTime: XR_CTime = game.get_game_time();

      if (this.isTimeForwarded) {
        const diff = math.abs(this.nextScheduledSurgeDelay - currentGameTime.diffSec(this.lastSurgeTime));

        if (diff < surgeConfig.INTERVAL_BETWEEN_SURGES.POST_TF_DELAY_MIN) {
          this.nextScheduledSurgeDelay =
            surgeConfig.INTERVAL_BETWEEN_SURGES.POST_TF_DELAY_MAX + currentGameTime.diffSec(this.lastSurgeTime);
        }

        this.isTimeForwarded = false;
      }

      if (currentGameTime.diffSec(this.lastSurgeTime) < this.nextScheduledSurgeDelay) {
        return;
      }

      if (pickSectionFromCondList(registry.actor, null, this.surgeManagerCondlist) !== "true") {
        return;
      }

      if (!this.getNearestAvailableCoverId()) {
        return;
      }

      this.start();

      return;
    }

    const surgeDuration: number = math.ceil(game.get_game_time().diffSec(this.initedTime) / level.get_time_factor());
    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (this.prev_sec !== surgeDuration) {
      this.prev_sec = surgeDuration;

      const cover = this.getNearestAvailableCoverId();

      if (cover === null && this.surgeCoversCount === 0) {
        this.initializeSurgeCovers();

        return;
      }

      if (!isSurgeEnabledOnLevel(level.name())) {
        this.endSurge();

        return;
      }

      if (surgeDuration >= surgeConfig.DURATION) {
        if (level !== null) {
          if (level.name() === levels.zaton) {
            globalSoundManager.setSoundPlaying(registry.actor.id(), "zat_a2_stalker_barmen_after_surge", null, null);
          } else if (level.name() === levels.jupiter) {
            globalSoundManager.setSoundPlaying(registry.actor.id(), "jup_a6_stalker_medik_after_surge", null, null);
          } else if (!hasAlifeInfo("pri_b305_fifth_cam_end")) {
            globalSoundManager.setSoundPlaying(registry.actor.id(), "pri_a17_kovalsky_after_surge", null, null);
          }
        }

        this.endSurge();
      } else {
        if (this.isLoaded) {
          if (this.blowout_sound) {
            globalSoundManager.playLoopedSound(registry.actor.id(), "blowout_rumble");
          }

          if (this.isEffectorSet) {
            level.add_pp_effector(post_processors.surge_shock, surge_shock_pp_eff_id, true);
          }

          if (this.second_message_given) {
            globalSoundManager.playLoopedSound(registry.actor.id(), "surge_earthquake_sound_looped");
            level.add_cam_effector(animations.camera_effects_earthquake, earthquake_cam_eff_id, true, "");
          }

          this.isLoaded = false;
        }

        this.launch_rockets();
        if (this.isEffectorSet) {
          level.set_pp_effector_factor(surge_shock_pp_eff_id, surgeDuration / 90, 0.1);
        }

        if (this.blowout_sound) {
          globalSoundManager.setLoopedSoundVolume(registry.actor.id(), "blowout_rumble", surgeDuration / 180);
        }

        if (
          surgeDuration >= 140 &&
          !this.ui_disabled &&
          (cover === null || !registry.objects.get(cover).object!.inside(registry.actor.position()))
        ) {
          let att: number = 1 - (185 - surgeDuration) / (185 - 140);

          att = att * att * att * 0.3;

          const h: XR_hit = new hit();

          h.type = hit.telepatic;
          h.power = att;
          h.impulse = 0.0;
          h.direction = new vector().set(0, 0, 1);
          h.draftsman = registry.actor;

          if (pickSectionFromCondList(registry.actor, null, this.surgeSurviveCondlist) === "true") {
            if (registry.actor.health <= h.power) {
              h.power = registry.actor.health - 0.05;
              if (h.power < 0) {
                h.power = 0;
              }
            }
          }

          registry.actor.hit(h);
        }

        if (surgeDuration >= 185 && !this.ui_disabled) {
          this.kill_all_unhided();
          this.ui_disabled = true;
        } else if (surgeDuration >= 140 && !this.second_message_given) {
          if (level !== null) {
            if (level.name() === levels.zaton) {
              globalSoundManager.setSoundPlaying(
                registry.actor.id(),
                "zat_a2_stalker_barmen_surge_phase_2",
                null,
                null
              );
            } else if (level.name() === levels.jupiter) {
              globalSoundManager.setSoundPlaying(registry.actor.id(), "jup_a6_stalker_medik_phase_2", null, null);
            } else if (!hasAlifeInfo("pri_b305_fifth_cam_end")) {
              globalSoundManager.setSoundPlaying(registry.actor.id(), "pri_a17_kovalsky_surge_phase_2", null, null);
            }
          }

          globalSoundManager.playLoopedSound(registry.actor.id(), "surge_earthquake_sound_looped");
          level.add_cam_effector(animations.camera_effects_earthquake, earthquake_cam_eff_id, true, "");
          this.second_message_given = true;
        } else if (surgeDuration >= 100 && !this.isEffectorSet) {
          level.add_pp_effector(post_processors.surge_shock, surge_shock_pp_eff_id, true);
          // --                level.set_pp_effector_factor(surge_shock_pp_eff, 0, 10)
          this.isEffectorSet = true;
        } else if (surgeDuration >= 35 && !this.blowout_sound) {
          globalSoundManager.setSoundPlaying(registry.actor.id(), "blowout_begin", null, null);
          globalSoundManager.playLoopedSound(registry.actor.id(), "blowout_rumble");
          globalSoundManager.setLoopedSoundVolume(registry.actor.id(), "blowout_rumble", 0.25);
          this.blowout_sound = true;
        } else if (surgeDuration >= 0 && !this.task_given) {
          if (level.name() === levels.zaton) {
            globalSoundManager.setSoundPlaying(registry.actor.id(), "zat_a2_stalker_barmen_surge_phase_1", null, null);
          } else if (level.name() === levels.jupiter) {
            globalSoundManager.setSoundPlaying(registry.actor.id(), "jup_a6_stalker_medik_phase_1", null, null);
          } else if (!hasAlifeInfo("pri_b305_fifth_cam_end")) {
            globalSoundManager.setSoundPlaying(registry.actor.id(), "pri_a17_kovalsky_surge_phase_1", null, null);
          }

          level.set_weather_fx("fx_surge_day_3");
          this.giveSurgeHideTask();
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, SurgeManager.name);
    packet.w_bool(this.isFinished);
    packet.w_bool(this.isStarted);
    writeCTimeToPacket(packet, this.lastSurgeTime);

    if (this.isStarted) {
      writeCTimeToPacket(packet, this.initedTime);

      packet.w_bool(this.levels_respawn.zaton!);
      packet.w_bool(this.levels_respawn.jupiter!);
      packet.w_bool(this.levels_respawn.pripyat!);

      packet.w_bool(this.task_given);
      packet.w_bool(this.isEffectorSet);
      packet.w_bool(this.second_message_given);
      packet.w_bool(this.ui_disabled);
      packet.w_bool(this.blowout_sound);

      packet.w_stringZ(this.surge_message);
      packet.w_stringZ(this.surge_task_sect);
    }

    packet.w_u32(this.nextScheduledSurgeDelay);
    setSaveMarker(packet, true, SurgeManager.name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, SurgeManager.name);

    this.isFinished = reader.r_bool();
    this.isStarted = reader.r_bool();
    this.lastSurgeTime = readCTimeFromPacket(reader)!;

    if (this.isStarted) {
      this.initedTime = readCTimeFromPacket(reader)!;

      this.levels_respawn.zaton = reader.r_bool();
      this.levels_respawn.jupiter = reader.r_bool();
      this.levels_respawn.pripyat = reader.r_bool();

      this.task_given = reader.r_bool();
      this.isEffectorSet = reader.r_bool();
      this.second_message_given = reader.r_bool();
      this.ui_disabled = reader.r_bool();
      this.blowout_sound = reader.r_bool();

      this.surge_message = reader.r_stringZ();
      this.surge_task_sect = reader.r_stringZ();
    }

    this.nextScheduledSurgeDelay = reader.r_u32();
    this.isLoaded = true;
    setLoadMarker(reader, true, SurgeManager.name);
  }
}
