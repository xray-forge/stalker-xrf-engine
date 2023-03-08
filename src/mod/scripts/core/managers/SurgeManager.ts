import {
  alife,
  device,
  game,
  hit,
  level,
  vector,
  XR_CTime,
  XR_game_object,
  XR_hit,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { animations } from "@/mod/globals/animation/animations";
import { post_processors } from "@/mod/globals/animation/post_processors";
import { captions } from "@/mod/globals/captions";
import { info_portions } from "@/mod/globals/info_portions";
import { levels, TLevel } from "@/mod/globals/levels";
import { STRINGIFIED_FALSE, STRINGIFIED_TRUE } from "@/mod/globals/lua";
import { surgeConfig } from "@/mod/lib/configs/SurgeConfig";
import { AnyCallablesModule, Optional, PartialRecord, TNumberId } from "@/mod/lib/types";
import { Squad } from "@/mod/scripts/core/alife/Squad";
import { registry, SURGE_MANAGER_LTX } from "@/mod/scripts/core/database";
import { pstor_retrieve, pstor_store } from "@/mod/scripts/core/database/pstor";
import { get_sim_board, SimBoard } from "@/mod/scripts/core/database/SimBoard";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { MapDisplayManager } from "@/mod/scripts/core/managers/map/MapDisplayManager";
import { notificationManagerIcons } from "@/mod/scripts/core/managers/notifications";
import { NotificationManager } from "@/mod/scripts/core/managers/notifications/NotificationManager";
import { StatisticsManager } from "@/mod/scripts/core/managers/StatisticsManager";
import { WeatherManager } from "@/mod/scripts/core/managers/WeatherManager";
import { isImmuneToSurge, isObjectOnLevel, isSurgeEnabledOnLevel } from "@/mod/scripts/utils/checkers/checkers";
import { isStoryObject } from "@/mod/scripts/utils/checkers/is";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { createScenarioAutoSave, setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { hasAlifeInfo } from "@/mod/scripts/utils/info_portions";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseConditionsList, TConditionList } from "@/mod/scripts/utils/parse";
import { copyTable } from "@/mod/scripts/utils/table";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

export const surge_shock_pp_eff_id: TNumberId = 1;
export const earthquake_cam_eff_id: TNumberId = 2;
export const sleep_cam_eff_id: TNumberId = 3;
export const sleep_fade_pp_eff_id: TNumberId = 4;

const logger: LuaLogger = new LuaLogger("SurgeManager");

/**
 * todo;
 */
export class SurgeManager extends AbstractCoreManager {
  private static check_squad_smart_props(squadId: TNumberId): boolean {
    const squad: Optional<Squad> = alife().object(squadId);

    if (squad) {
      const board = get_sim_board();

      if (board && squad.smart_id && board.smarts.get(squad.smart_id)) {
        const smart = board.smarts.get(squad.smart_id).smrt;

        if (tonumber(smart.props["surge"])! <= 0) {
          return true;
        }
      }
    }

    return false; // -- can't delete squad in his smart if squad is in cover
  }

  public levels_respawn: PartialRecord<TLevel, boolean> = { zaton: false, jupiter: false, pripyat: false };

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

  public loaded: boolean = false;
  public surge_message: string = "";
  public surge_task_sect: string = "";

  /**
   * todo;
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

    let cond_string: string = STRINGIFIED_TRUE;

    if (SURGE_MANAGER_LTX.line_exist("settings", "condlist")) {
      cond_string = SURGE_MANAGER_LTX.r_string("settings", "condlist");
    }

    this.surgeManagerCondlist = parseConditionsList(null, "surge_manager", "condlist", cond_string);

    cond_string = STRINGIFIED_FALSE;

    if (SURGE_MANAGER_LTX.line_exist("settings", "survive")) {
      cond_string = SURGE_MANAGER_LTX.r_string("settings", "survive");
    }

    this.surgeSurviveCondlist = parseConditionsList(null, "surge_manager", "survive_condlist", cond_string);

    this.initializeSurgeCovers();

    this.surge_message = "";
    this.surge_task_sect = "";
    this.loaded = false;
  }

  /**
   * todo;
   */
  public initializeSurgeCovers(): void {
    for (const i of $range(0, SURGE_MANAGER_LTX.line_count("list") - 1)) {
      const [temp1, id, temp2] = SURGE_MANAGER_LTX.r_line("list", i, "", "");
      const zone: Optional<XR_game_object> = registry.zones.get(id);

      if (zone !== null) {
        this.surgeCoversCount = this.surgeCoversCount + 1;
        this.covers.set(this.surgeCoversCount, zone);

        if (SURGE_MANAGER_LTX.line_exist(id, "condlist")) {
          (this.covers.get(this.surgeCoversCount) as any).condlist = parseConditionsList(
            null,
            id,
            "condlist",
            SURGE_MANAGER_LTX.r_string(id, "condlist")
          );
        }
      }
    }
  }

  /**
   * todo;
   */
  public getNearestAvailableCover(): Optional<number> {
    logger.info("Getting nearest cover");

    if (this.loaded) {
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
   * todo;
   */
  public isActorInCover(): boolean {
    const cover_id: Optional<number> = this.getNearestAvailableCover();

    return cover_id !== null && registry.objects.get(cover_id).object!.inside(registry.actor.position());
  }

  /**
   * todo
   */
  public setSkipResurrectMessage(): void {
    this.skipMessage = false;
  }

  /**
   * todo;
   */
  public setSurgeTask(task: string): void {
    this.surge_task_sect = task;
  }

  /**
   * todo;
   */
  public setSurgeMessage(message: string): void {
    this.surge_message = message;
  }

  /**
   * todo;
   */
  public getTaskTarget(): Optional<number> {
    if (this.isActorInCover()) {
      return null;
    }

    return this.getNearestAvailableCover();
  }

  /**
   * todo;
   */
  public isKillingAll(): boolean {
    return this.isStarted && this.ui_disabled;
  }

  /**
   * todo;
   */
  public requestSurgeStart(): void {
    logger.info("Request surge start");

    if (this.getNearestAvailableCover()) {
      this.start(true);
    } else {
      logger.info("Error: Surge covers are not set! Can't manually start");
    }
  }

  /**
   * todo;
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
   * todo;
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
   * todo;
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

    if (this.loaded) {
      this.kill_all_unhided();
    }

    this.respawnArtefactsAndReplaceAnomalyZones();
    StatisticsManager.getInstance().incrementSurgesCount();
  }

  /**
   * todo;
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

    const board: SimBoard = get_sim_board();
    const levelName: TLevel = level.name();

    logger.info("Releasing squads:", board.squads.length());

    for (const [squadId, squad] of board.squads) {
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

    const cover = this.getNearestAvailableCover();

    if (registry.actor.alive()) {
      if (
        !(cover && registry.objects.get(cover) && registry.objects.get(cover).object!.inside(registry.actor.position()))
      ) {
        if (hasAlifeInfo(info_portions.anabiotic_in_process)) {
          const counter_name = "actor_marked_by_zone_cnt";
          const cnt_value: number = pstor_retrieve(registry.actor, counter_name, 0);

          pstor_store(registry.actor, counter_name, cnt_value + 1);
        }

        get_global<AnyCallablesModule>("xr_effects").disable_ui_only(registry.actor, null);
        if (pickSectionFromCondList(registry.actor, null, this.surgeSurviveCondlist) !== STRINGIFIED_TRUE) {
          this.kill_all_unhided_after_actor_death();
          registry.actor.kill(registry.actor);

          return;
        } else {
          level.add_cam_effector(animations.camera_effects_surge_02, sleep_cam_eff_id, false, "extern.surge_callback");
          level.add_pp_effector(post_processors.surge_fade, sleep_fade_pp_eff_id, false);
          registry.actor.health = registry.actor.health - 0.05;
        }
      }
    }
  }

  /**
   * todo;
   */
  protected kill_all_unhided_after_actor_death(): void {
    const board: SimBoard = get_sim_board();
    const levelName: TLevel = level.name();

    for (const [squadId, squad] of board.squads) {
      if (isObjectOnLevel(squad, levelName) && !isImmuneToSurge(squad)) {
        for (const member of squad.squad_members()) {
          let isInCover: boolean = false;

          for (const i of $range(1, this.covers.length())) {
            const cover: Optional<XR_game_object> = this.covers.get(i);

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
   * todo;
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
   * todo;
   */
  protected giveSurgeHideTask(): void {
    if (this.surge_task_sect !== "empty") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { get_task_manager } = require("@/mod/scripts/core/managers/tasks/TaskManager");

      if (this.surge_task_sect === "") {
        get_task_manager().give_task("hide_from_surge");
      } else {
        get_task_manager().give_task(this.surge_task_sect);
      }

      this.task_given = true;
    }
  }

  /**
   * todo;
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
   * todo;
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

      if (!this.getNearestAvailableCover()) {
        return;
      }

      this.start();

      return;
    }

    const surgeDuration: number = math.ceil(game.get_game_time().diffSec(this.initedTime) / level.get_time_factor());
    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (this.prev_sec !== surgeDuration) {
      this.prev_sec = surgeDuration;

      const cover = this.getNearestAvailableCover();

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
        if (this.loaded) {
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

          this.loaded = false;
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
   * todo;
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
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, SurgeManager.name);

    this.initialize();
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
    this.loaded = true;
    setLoadMarker(reader, true, SurgeManager.name);
  }
}
