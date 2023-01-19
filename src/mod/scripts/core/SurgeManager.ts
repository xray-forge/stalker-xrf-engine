import { mapDisplayManager } from "scripts/ui/game/MapDisplayManager";
import {
  alife,
  device,
  game,
  hit,
  ini_file,
  level,
  vector,
  XR_CTime,
  XR_game_object,
  XR_hit,
  XR_ini_file,
  XR_net_packet
} from "xray16";

import { animations } from "@/mod/globals/animations";
import { levels, TLevel } from "@/mod/globals/levels";
import { surgeConfig } from "@/mod/lib/configs/SurgeConfig";
import { AnyCallablesModule, Optional, PartialRecord } from "@/mod/lib/types";
import { anomalyByName, CROW_STORAGE, getActor, signalLight, storage, zoneByName } from "@/mod/scripts/core/db";
import { send_tip } from "@/mod/scripts/core/NewsManager";
import { get_weather_manager } from "@/mod/scripts/core/WeatherManager";
import { get_sim_board, ISimBoard } from "@/mod/scripts/se/SimBoard";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { AbstractSingletonManager } from "@/mod/scripts/utils/AbstractSingletonManager";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { getStoryObject } from "@/mod/scripts/utils/alife";
import { isImmuneToSurge, isObjectOnLevel, isStoryObject, isSurgeEnabledOnLevel } from "@/mod/scripts/utils/checkers";
import { parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { copyTable } from "@/mod/scripts/utils/table";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

export const surge_shock_pp_eff_id: number = 1;
export const earthquake_cam_eff_id: number = 2;
export const sleep_cam_eff_id: number = 3;
export const sleep_fade_pp_eff_id: number = 4;

const log: LuaLogger = new LuaLogger("SurgeManager");

export class SurgeManager extends AbstractSingletonManager {
  public ini: XR_ini_file = new ini_file("misc\\surge_manager.ltx");
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
  public surgeManagerCondlist: LuaTable = new LuaTable();
  public surgeSurviveCondlist: LuaTable = new LuaTable();

  public loaded: boolean = false;
  public surge_message: string = "";
  public surge_task_sect: string = "";

  public initialize(): void {
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

    let cond_string: string = "true";

    if (this.ini.line_exist("settings", "condlist")) {
      cond_string = this.ini.r_string("settings", "condlist");
    }

    this.surgeManagerCondlist = parseCondList(null, "surge_manager", "condlist", cond_string);

    cond_string = "false";

    if (this.ini.line_exist("settings", "survive")) {
      cond_string = this.ini.r_string("settings", "survive");
    }

    this.surgeSurviveCondlist = parseCondList(null, "surge_manager", "survive_condlist", cond_string);

    this.initializeSurgeCovers();

    this.surge_message = "";
    this.surge_task_sect = "";
    this.loaded = false;
  }

  public initializeSurgeCovers(): void {
    for (const i of $range(0, this.ini.line_count("list") - 1)) {
      const [temp1, id, temp2] = this.ini.r_line("list", i, "", "");
      const zone: Optional<XR_game_object> = zoneByName.get(id);

      if (zone !== null) {
        this.surgeCoversCount = this.surgeCoversCount + 1;
        this.covers.set(this.surgeCoversCount, zone);

        if (this.ini.line_exist(id, "condlist")) {
          (this.covers.get(this.surgeCoversCount) as any).condlist = parseCondList(
            null,
            id,
            "condlist",
            this.ini.r_string(id, "condlist")
          );
        }
      }
    }
  }

  public getNearestAvailableCover(): Optional<number> {
    log.info("Getting nearest cover");

    if (this.loaded) {
      this.initializeSurgeCovers();
    }

    const hides: LuaTable<number> = new LuaTable();

    copyTable(hides, this.covers);

    // Remove camps that are alarmed and actor is unable to enter
    if (this.surgeCoversCount > 0) {
      for (const [k, v] of hides) {
        if (v.condlist) {
          const sect: Optional<string> = pickSectionFromCondList(getActor(), null, v.condlist);

          if (sect !== "true" && sect !== null) {
            table.remove(hides, k);
          }
        }
      }

      let nearest_cover_id = hides.get(1).id();
      let nearest_cover_dist = hides.get(1).position().distance_to(getActor()!.position());

      for (const [k, v] of hides) {
        if (storage.get(v.id()).object!.inside(getActor()!.position())) {
          return v.id();
        }

        const dist = v.position().distance_to(getActor()!.position());

        if (dist < nearest_cover_dist) {
          if (v.condlist) {
            const sect: Optional<string> = pickSectionFromCondList(getActor(), null, v.condlist);

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
          const sect = pickSectionFromCondList(getActor(), null, hides.get(1).condlist);

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

  public update(): void {
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

      if (pickSectionFromCondList(getStoryObject("actor"), null, this.surgeManagerCondlist) !== "true") {
        return;
      }

      if (!this.getNearestAvailableCover()) {
        return;
      }

      this.start();

      return;
    }

    const surgeDuration: number = math.ceil(game.get_game_time().diffSec(this.initedTime) / level.get_time_factor());

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
            get_global<AnyCallablesModule>("xr_sound").set_sound_play(
              getActor()!.id(),
              "zat_a2_stalker_barmen_after_surge"
            );
          } else if (level.name() === levels.jupiter) {
            get_global<AnyCallablesModule>("xr_sound").set_sound_play(
              getActor()!.id(),
              "jup_a6_stalker_medik_after_surge"
            );
          } else if (!hasAlifeInfo("pri_b305_fifth_cam_end")) {
            get_global<AnyCallablesModule>("xr_sound").set_sound_play(getActor()!.id(), "pri_a17_kovalsky_after_surge");
          }
        }

        this.endSurge();
      } else {
        if (this.loaded) {
          if (this.blowout_sound) {
            get_global<AnyCallablesModule>("xr_sound").play_sound_looped(getActor()!.id(), "blowout_rumble");
          }

          if (this.isEffectorSet) {
            level.add_pp_effector(animations.surge_shock, surge_shock_pp_eff_id, true);
          }

          if (this.second_message_given) {
            get_global<AnyCallablesModule>("xr_sound").play_sound_looped(
              getActor()!.id(),
              "surge_earthquake_sound_looped"
            );
            level.add_cam_effector(animations.camera_effects_earthquake, earthquake_cam_eff_id, true, "");
          }

          this.loaded = false;
        }

        this.launch_rockets();
        if (this.isEffectorSet) {
          level.set_pp_effector_factor(surge_shock_pp_eff_id, surgeDuration / 90, 0.1);
        }

        if (this.blowout_sound) {
          get_global<AnyCallablesModule>("xr_sound").set_volume_sound_looped(
            getActor()!.id(),
            "blowout_rumble",
            surgeDuration / 180
          );
        }

        if (
          surgeDuration >= 140 &&
          !this.ui_disabled &&
          (cover === null || !storage.get(cover).object!.inside(getActor()!.position()))
        ) {
          let att: number = 1 - (185 - surgeDuration) / (185 - 140);

          att = att * att * att * 0.3;

          const h: XR_hit = new hit();

          h.type = hit.telepatic;
          h.power = att;
          h.impulse = 0.0;
          h.direction = new vector().set(0, 0, 1);
          h.draftsman = getActor();

          if (pickSectionFromCondList(getStoryObject("actor"), null, this.surgeSurviveCondlist) === "true") {
            if (getActor()!.health <= h.power) {
              h.power = getActor()!.health - 0.05;
              if (h.power < 0) {
                h.power = 0;
              }
            }
          }

          getActor()!.hit(h);
        }

        if (surgeDuration >= 185 && !this.ui_disabled) {
          this.kill_all_unhided();
          this.ui_disabled = true;
        } else if (surgeDuration >= 140 && !this.second_message_given) {
          if (level !== null) {
            if (level.name() === levels.zaton) {
              get_global<AnyCallablesModule>("xr_sound").set_sound_play(
                getActor()!.id(),
                "zat_a2_stalker_barmen_surge_phase_2"
              );
            } else if (level.name() === levels.jupiter) {
              get_global<AnyCallablesModule>("xr_sound").set_sound_play(
                getActor()!.id(),
                "jup_a6_stalker_medik_phase_2"
              );
            } else if (!hasAlifeInfo("pri_b305_fifth_cam_end")) {
              get_global<AnyCallablesModule>("xr_sound").set_sound_play(
                getActor()!.id(),
                "pri_a17_kovalsky_surge_phase_2"
              );
            }
          }

          get_global<AnyCallablesModule>("xr_sound").play_sound_looped(
            getActor()!.id(),
            "surge_earthquake_sound_looped"
          );
          level.add_cam_effector(animations.camera_effects_earthquake, earthquake_cam_eff_id, true, "");
          this.second_message_given = true;
        } else if (surgeDuration >= 100 && !this.isEffectorSet) {
          level.add_pp_effector(animations.surge_shock, surge_shock_pp_eff_id, true);
          // --                level.set_pp_effector_factor(surge_shock_pp_eff, 0, 10)
          this.isEffectorSet = true;
        } else if (surgeDuration >= 35 && !this.blowout_sound) {
          get_global<AnyCallablesModule>("xr_sound").set_sound_play(getActor()!.id(), "blowout_begin");
          get_global<AnyCallablesModule>("xr_sound").play_sound_looped(getActor()!.id(), "blowout_rumble");
          get_global<AnyCallablesModule>("xr_sound").set_volume_sound_looped(getActor()!.id(), "blowout_rumble", 0.25);
          this.blowout_sound = true;
        } else if (surgeDuration >= 0 && !this.task_given) {
          if (level.name() === levels.zaton) {
            get_global<AnyCallablesModule>("xr_sound").set_sound_play(
              getActor()!.id(),
              "zat_a2_stalker_barmen_surge_phase_1"
            );
          } else if (level.name() === levels.jupiter) {
            get_global<AnyCallablesModule>("xr_sound").set_sound_play(getActor()!.id(), "jup_a6_stalker_medik_phase_1");
          } else if (!hasAlifeInfo("pri_b305_fifth_cam_end")) {
            get_global<AnyCallablesModule>("xr_sound").set_sound_play(
              getActor()!.id(),
              "pri_a17_kovalsky_surge_phase_1"
            );
          }

          level.set_weather_fx("fx_surge_day_3");
          this.giveSurgeHideTask();
        }
      }
    }
  }

  public start(manual?: boolean): void {
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
      if (!hasAlifeInfo("pri_b305_fifth_cam_end") || hasAlifeInfo("pri_a28_actor_in_zone_stay")) {
        get_global<AnyCallablesModule>("xr_effects").scenario_autosave(null, null, ["st_save_uni_surge_start"]);
      }
    }
  }

  public skipSurge(): void {
    log.info("Skip surge");

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
    get_global<AnyCallablesModule>("xr_statistic").inc_surges_counter();

    if (!this.skipMessage) {
      send_tip(getActor()!, "st_surge_while_asleep", null, "recent_surge", null, null);
      this.skipMessage = true;
    }
  }

  public endSurge(manual?: boolean): void {
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

    if (this.isEffectorSet) {
      get_global<AnyCallablesModule>("xr_sound").stop_sound_looped(getActor()!.id(), "blowout_rumble");
    }

    if (this.second_message_given) {
      get_global<AnyCallablesModule>("xr_sound").stop_sound_looped(getActor()!.id(), "surge_earthquake_sound_looped");
    }

    level.remove_pp_effector(surge_shock_pp_eff_id);
    level.remove_cam_effector(earthquake_cam_eff_id);

    if (manual || (this.isTimeForwarded && get_weather_manager().weather_fx)) {
      level.stop_weather_fx();
      // --        WeatherManager.get_weather_manager():select_weather(true)
      get_weather_manager().forced_weather_change();
    }

    this.isEffectorSet = false;
    this.second_message_given = false;
    this.ui_disabled = false;
    this.blowout_sound = false;
    this.prev_sec = 0;

    for (const [k, v] of signalLight) {
      log.info("Stop signal light");
      v.stop_light();
      v.stop();
    }

    if (this.loaded) {
      this.kill_all_unhided();
    }

    this.respawnArtefactsAndReplaceAnomalyZones();
    get_global<AnyCallablesModule>("xr_statistic").inc_surges_counter();
  }

  public kill_all_unhided(): void {
    log.info("Kill all surge unhided");

    const h: XR_hit = new hit();

    h.type = hit.fire_wound;
    h.power = 0.9;
    h.impulse = 0.0;
    h.direction = new vector().set(0, 0, 1);
    h.draftsman = getActor();

    for (const [k, v] of CROW_STORAGE.STORAGE) {
      log.info("Kill crows");

      const obj = alife().object(v);

      if (obj) {
        const crow = level.object_by_id(obj.id);

        if (crow && crow.alive()) {
          crow.hit(h);
        }
      }
    }

    const board: ISimBoard = get_sim_board();
    const levelName: TLevel = level.name();

    log.info("Releasing squads:", board.squads.length());

    for (const [squadId, squad] of board.squads) {
      if (isObjectOnLevel(squad, levelName) && !isImmuneToSurge(squad) && !isStoryObject(squad)) {
        for (const member of squad.squad_members()) {
          if (!isStoryObject(member.object)) {
            if (check_squad_smart_props(squad.id)) {
              log.info("Releasing npc from squad because of surge:", member.object.name(), squad.name());

              const cl_obj = level.object_by_id(member.object.id);

              if (cl_obj !== null) {
                cl_obj.kill(cl_obj);
              } else {
                member.object.kill();
              }
            } else {
              let release = true;

              for (const i of $range(1, this.covers.length())) {
                const sr = this.covers.get(i);

                if (sr && sr.inside(member.object.position)) {
                  release = false;
                }
              }

              if (release) {
                log.info("Releasing npc from squad because of surge:", member.object.name(), squad.name());

                const cl_obj = level.object_by_id(member.object.id);

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
    }

    const cover = this.getNearestAvailableCover();

    if (getActor() && getActor()!.alive()) {
      if (!(cover && storage.get(cover) && storage.get(cover).object!.inside(getActor()!.position()))) {
        if (hasAlifeInfo("anabiotic_in_process")) {
          const counter_name = "actor_marked_by_zone_cnt";
          const cnt_value = get_global<AnyCallablesModule>("xr_logic").pstor_retrieve(getActor(), counter_name, 0);

          get_global<AnyCallablesModule>("xr_logic").pstor_store(getActor(), counter_name, cnt_value + 1);
        }

        /* --[[
      const hud = get_hud()
      hud:HideActorMenu()
      hud:HidePdaMenu()
      getActor():stop_talk()
      level.disable_input()
      level.hide_indicators_safe()
      getActor():hide_weapon()
    ]]--*/
        get_global<AnyCallablesModule>("xr_effects").disable_ui_only(getActor(), null);
        if (pickSectionFromCondList(getActor(), null, this.surgeSurviveCondlist) !== "true") {
          this.kill_all_unhided_after_actor_death();
          getActor()!.kill(getActor()!);

          return;
        } else {
          level.add_cam_effector(animations.camera_effects_surge_02, sleep_cam_eff_id, false, "_extern.surge_callback");
          level.add_pp_effector(animations.surge_fade, sleep_fade_pp_eff_id, false);
          getActor()!.health = getActor()!.health - 0.05;
        }
      }
    }
  }

  public kill_all_unhided_after_actor_death(): void {
    const board: ISimBoard = get_sim_board();
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
            log.info(
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

  public respawnArtefactsAndReplaceAnomalyZones(): void {
    const lvl_nm: TLevel = level.name();

    if (this.levels_respawn[lvl_nm]) {
      this.levels_respawn[lvl_nm] = false;
    }

    for (const [k, v] of anomalyByName) {
      v.respawnArtefactsAndReplaceAnomalyZones();
      // --printf("respawn artefacts in anomal zone [%s]", tostring(k))
    }

    mapDisplayManager.updateAnomaliesZones();
  }

  public giveSurgeHideTask(): void {
    if (this.surge_task_sect !== "empty") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { get_task_manager } = require("@/mod/scripts/se/task/TaskManager");

      if (this.surge_task_sect === "") {
        get_task_manager().give_task("hide_from_surge");
      } else {
        get_task_manager().give_task(this.surge_task_sect);
      }

      this.task_given = true;
    }
  }

  public launch_rockets(): void {
    log.info("Launch rockets");
    for (const [k, v] of signalLight) {
      log.info("Start signal light");
      if (!v.is_flying()) {
        v.launch();
      }
    }
  }

  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "SurgeManager");
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
    setSaveMarker(packet, true, "SurgeManager");
  }

  public load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "SurgeManager");
    this.initialize();
    this.isFinished = packet.r_bool();
    this.isStarted = packet.r_bool();
    this.lastSurgeTime = readCTimeFromPacket(packet)!;

    if (this.isStarted) {
      this.initedTime = readCTimeFromPacket(packet)!;

      this.levels_respawn.zaton = packet.r_bool();
      this.levels_respawn.jupiter = packet.r_bool();
      this.levels_respawn.pripyat = packet.r_bool();

      this.task_given = packet.r_bool();
      this.isEffectorSet = packet.r_bool();
      this.second_message_given = packet.r_bool();
      this.ui_disabled = packet.r_bool();
      this.blowout_sound = packet.r_bool();

      this.surge_message = packet.r_stringZ();
      this.surge_task_sect = packet.r_stringZ();
    }

    this.nextScheduledSurgeDelay = packet.r_u32();
    this.loaded = true;
    setLoadMarker(packet, true, "SurgeManager");
  }
}

export const surge_manager: SurgeManager = SurgeManager.getInstance();

export function check_squad_smart_props(squad_id: number): boolean {
  const squad: Optional<ISimSquad> = alife().object(squad_id);

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

export function start_surge(): void {
  const surgeManager: SurgeManager = SurgeManager.getInstance();

  if (surgeManager.getNearestAvailableCover()) {
    surgeManager.start(true);
  } else {
    log.info("Error: Surge covers are not set! Can't manually start");
  }
}

export function actor_in_cover(): boolean {
  const cover_id: Optional<number> = SurgeManager.getInstance<SurgeManager>().getNearestAvailableCover();

  return cover_id !== null && storage.get(cover_id).object!.inside(getActor()!.position());
}

export function stop_surge(): void {
  const m = get_surge_manager();

  if (m.isStarted) {
    m.endSurge(true);
  }
}

export function get_task_target(): Optional<number> {
  const m = get_surge_manager();

  if (actor_in_cover()) {
    return null;
  }

  return m.getNearestAvailableCover();
}

export function set_surge_message(message: string): void {
  SurgeManager.getInstance<SurgeManager>().surge_message = message;
}

export function set_surge_task(task: string): void {
  SurgeManager.getInstance<SurgeManager>().surge_task_sect = task;
}

export function is_killing_all(): boolean {
  const m: SurgeManager = SurgeManager.getInstance();

  return m.isStarted && m.ui_disabled;
}

export function is_started(): boolean {
  return SurgeManager.getInstance<SurgeManager>().isStarted;
}

export function is_finished(): boolean {
  return SurgeManager.getInstance<SurgeManager>().isFinished;
}

export function get_surge_manager(): SurgeManager {
  return SurgeManager.getInstance();
}

export function resurrect_skip_message(): void {
  SurgeManager.getInstance<SurgeManager>().skipMessage = false;
}

export function sound_started(): boolean {
  const m: SurgeManager = SurgeManager.getInstance();

  return m.isStarted && m.blowout_sound;
}
