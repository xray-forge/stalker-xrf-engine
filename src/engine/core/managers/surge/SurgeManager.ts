import { game, hit, level } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker, registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import {
  getNearestAvailableSurgeCover,
  initializeSurgeCovers,
  killAllSurgeUnhidden,
  launchSurgeSignalRockets,
} from "@/engine/core/managers/surge/utils";
import { TaskManager } from "@/engine/core/managers/tasks";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import type { AnomalyZoneBinder } from "@/engine/core/objects/binders/zones";
import { isBlackScreen } from "@/engine/core/utils/game";
import { executeConsoleCommand, getConsoleFloatCommand } from "@/engine/core/utils/game/game_console";
import { createGameAutoSave } from "@/engine/core/utils/game/game_save";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/game/game_time";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isArtefact, isSurgeEnabledOnLevel } from "@/engine/core/utils/object";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { createVector } from "@/engine/core/utils/vector";
import { animations, postProcessors } from "@/engine/lib/constants/animation";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { TRUE } from "@/engine/lib/constants/words";
import {
  ClientObject,
  Hit,
  NetPacket,
  NetProcessor,
  Optional,
  ServerObject,
  TCount,
  TDuration,
  Time,
  TLabel,
  TName,
  TRate,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Separate manager to handle artefacts spawn / ownership etc in parallel, do not mix logic.
 */
export class SurgeManager extends AbstractManager {
  // Whether manager should respawn artefacts for specific level.
  public respawnArtefactsForLevel: LuaTable<TName, boolean> = new LuaTable();
  public currentDuration: TTimestamp = 0;

  public isEffectorSet: boolean = false;
  public isAfterGameLoad: boolean = false;
  public isUiDisabled: boolean = false;
  public isTaskGiven: boolean = false;
  public isSecondMessageGiven: boolean = false;
  public isSkipMessageToggled: boolean = false;
  public isBlowoutSoundEnabled: boolean = false;

  public initializedAt: Time = game.get_game_time();
  public lastSurgeAt: Time = game.get_game_time();

  public surgeMessage: TLabel = "";
  public surgeTaskSection: TSection = "";

  /**
   * Delay of next surge happening.
   * Next surge is timestamp is `lastTimestamp + delay`.
   */
  public nextScheduledSurgeDelay: TDuration = math.random(
    surgeConfig.INTERVAL_MIN_FIRST_TIME,
    surgeConfig.INTERVAL_MAX_FIRST_TIME
  );

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_GO_ONLINE, this.onActorNetworkSpawn, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_USE_ITEM, this.onActorUseItem, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_ONLINE, this.onActorNetworkSpawn);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_USE_ITEM, this.onActorUseItem);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake);
  }

  /**
   * todo
   */
  public setSkipResurrectMessage(): void {
    this.isSkipMessageToggled = false;
  }

  /**
   * todo: Description.
   */
  public setSurgeTask(task: TSection): void {
    this.surgeTaskSection = task;
  }

  /**
   * todo: Description.
   */
  public setSurgeMessage(message: TLabel): void {
    this.surgeMessage = message;
  }

  /**
   * todo: Description.
   */
  public isKillingAll(): boolean {
    return surgeConfig.IS_STARTED && this.isUiDisabled;
  }

  /**
   * todo: Description.
   */
  protected giveSurgeHideTask(): void {
    if (this.surgeTaskSection !== "empty") {
      TaskManager.getInstance().giveTask(this.surgeTaskSection === "" ? "hide_from_surge" : this.surgeTaskSection);
      this.isTaskGiven = true;
    }
  }

  /**
   * todo: Description.
   */
  public requestSurgeStart(): void {
    logger.info("Request surge start");

    if (getNearestAvailableSurgeCover(registry.actor)) {
      this.start(true);
    } else {
      logger.info("Surge covers are not set! Can't manually start");
    }
  }

  /**
   * todo: Description.
   */
  public requestSurgeStop(): void {
    logger.info("Request surge stop");

    if (surgeConfig.IS_STARTED) {
      this.endSurge(true);
    }
  }

  /**
   * Start surge.
   */
  public start(isForced?: boolean): void {
    logger.info("Surge start");

    const [Y, M, D, h, m, s, ms] = this.lastSurgeAt.get(0, 0, 0, 0, 0, 0, 0);

    if (isForced) {
      this.initializedAt = game.get_game_time();
    } else {
      this.initializedAt.set(Y, M, D, h, m, s + this.nextScheduledSurgeDelay, ms);
    }

    const diffSec: TDuration = math.ceil(game.get_game_time().diffSec(this.initializedAt) / level.get_time_factor());

    if (!isSurgeEnabledOnLevel(level.name())) {
      logger.info("Surge is not enabled on level");

      this.isSkipMessageToggled = true;
      this.skipSurge();

      return;
    }

    if (diffSec + 6 > surgeConfig.DURATION) {
      logger.info("Surge can be considered skipped:", diffSec + 6);

      this.skipSurge();
    } else {
      surgeConfig.IS_STARTED = true;
      surgeConfig.IS_FINISHED = false;

      if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end) || hasAlifeInfo(infoPortions.pri_a28_actor_in_zone_stay)) {
        createGameAutoSave("st_save_uni_surge_start");
      }
    }
  }

  /**
   * todo: Description.
   */
  public skipSurge(): void {
    logger.info("Skipped surge");

    const [Y, M, D, h, m, s, ms] = this.initializedAt.get(0, 0, 0, 0, 0, 0, 0);

    this.lastSurgeAt.set(Y, M, D, h, m, s + surgeConfig.DURATION, ms);

    surgeConfig.IS_STARTED = false;
    surgeConfig.IS_FINISHED = true;

    for (const [level] of surgeConfig.RESPAWN_ARTEFACTS_LEVELS) {
      this.respawnArtefactsForLevel.set(level, true);
    }

    this.nextScheduledSurgeDelay = math.random(surgeConfig.INTERVAL_MIN, surgeConfig.INTERVAL_MAX);
    this.surgeMessage = "";
    this.surgeTaskSection = "";
    this.isTaskGiven = false;

    this.isEffectorSet = false;
    this.isSecondMessageGiven = false;
    this.isUiDisabled = false;
    this.isBlowoutSoundEnabled = false;
    this.currentDuration = 0;

    this.respawnArtefactsAndReplaceAnomalyZones();

    EventsManager.emitEvent(EGameEvent.SURGE_SKIPPED, !this.isSkipMessageToggled);

    this.isSkipMessageToggled = true;
  }

  /**
   * todo: Description.
   */
  public endSurge(manual?: boolean): void {
    logger.info("Ending surge:", manual);

    surgeConfig.IS_STARTED = false;
    surgeConfig.IS_FINISHED = true;

    for (const [level] of surgeConfig.RESPAWN_ARTEFACTS_LEVELS) {
      this.respawnArtefactsForLevel.set(level, true);
    }

    this.lastSurgeAt = game.get_game_time();
    this.nextScheduledSurgeDelay = math.random(surgeConfig.INTERVAL_MIN, surgeConfig.INTERVAL_MAX);
    this.surgeMessage = "";
    this.surgeTaskSection = "";
    this.isTaskGiven = false;

    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (this.isEffectorSet) {
      globalSoundManager.stopLoopedSound(ACTOR_ID, "blowout_rumble");
    }

    if (this.isSecondMessageGiven) {
      globalSoundManager.stopLoopedSound(ACTOR_ID, "surge_earthquake_sound_looped");
    }

    level.remove_pp_effector(surgeConfig.SURGE_SHOCK_PP_EFFECTOR_ID);
    level.remove_cam_effector(surgeConfig.EARTHQUAKE_CAM_EFFECTOR_ID);

    if (manual || (surgeConfig.IS_TIME_FORWARDED && WeatherManager.getInstance().weatherFx)) {
      level.stop_weather_fx();
      WeatherManager.getInstance().forceWeatherChange();
    }

    this.isEffectorSet = false;
    this.isSecondMessageGiven = false;
    this.isUiDisabled = false;
    this.isBlowoutSoundEnabled = false;
    this.currentDuration = 0;

    for (const [, signalLight] of registry.signalLights) {
      logger.info("Stop signal light");
      signalLight.stopLight();
      signalLight.stop();
    }

    if (this.isAfterGameLoad) {
      killAllSurgeUnhidden();
    }

    this.respawnArtefactsAndReplaceAnomalyZones();

    EventsManager.emitEvent(EGameEvent.SURGE_ENDED);
  }

  /**
   * todo: Description.
   */
  public respawnArtefactsAndReplaceAnomalyZones(): void {
    const levelName: TLevel = level.name();

    if (this.respawnArtefactsForLevel.get(levelName)) {
      this.respawnArtefactsForLevel.delete(levelName);
    }

    for (const [, anomalyZone] of registry.anomalyZones) {
      anomalyZone.respawnArtefactsAndReplaceAnomalyZones();
    }

    MapDisplayManager.getInstance().updateAnomalyZonesDisplay();
  }

  /**
   * todo: Description.
   */
  public processAnabioticItemUsage(): void {
    ActorInputManager.getInstance().disableGameUiOnly();

    level.add_cam_effector(animations.camera_effects_surge_02, 10, false, "engine.on_anabiotic_sleep");
    level.add_pp_effector(postProcessors.surge_fade, 11, false);

    giveInfo(infoPortions.anabiotic_in_process);

    registry.sounds.musicVolume = getConsoleFloatCommand(consoleCommands.snd_volume_music);
    registry.sounds.effectsVolume = getConsoleFloatCommand(consoleCommands.snd_volume_eff);

    executeConsoleCommand(consoleCommands.snd_volume_music, 0);
    executeConsoleCommand(consoleCommands.snd_volume_eff, 0);
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    if (isBlackScreen()) {
      return;
    }

    if (this.respawnArtefactsForLevel.get(level.name())) {
      this.respawnArtefactsAndReplaceAnomalyZones();
    }

    if (!surgeConfig.IS_STARTED) {
      const currentGameTime: Time = game.get_game_time();

      if (surgeConfig.IS_TIME_FORWARDED) {
        const diff: TCount = math.abs(this.nextScheduledSurgeDelay - currentGameTime.diffSec(this.lastSurgeAt));

        if (diff < surgeConfig.INTERVAL_MIN_AFTER_TIME_FORWARD) {
          logger.info("Time forward, reschedule from:", this.nextScheduledSurgeDelay);

          this.nextScheduledSurgeDelay =
            surgeConfig.INTERVAL_MAX_AFTER_TIME_FORWARD + currentGameTime.diffSec(this.lastSurgeAt);

          logger.info("Time forward, reschedule to:", this.nextScheduledSurgeDelay);
        }

        surgeConfig.IS_TIME_FORWARDED = false;
      }

      if (currentGameTime.diffSec(this.lastSurgeAt) < this.nextScheduledSurgeDelay) {
        return;
      }

      if (pickSectionFromCondList(registry.actor, null, surgeConfig.CAN_START_SURGE) !== TRUE) {
        return;
      }

      if (!getNearestAvailableSurgeCover(registry.actor)) {
        return;
      }

      return this.start();
    }

    const surgeDuration: TDuration = math.ceil(
      game.get_game_time().diffSec(this.initializedAt) / level.get_time_factor()
    );

    if (this.currentDuration !== surgeDuration) {
      this.currentDuration = surgeDuration;

      const coverObject: Optional<ClientObject> = getNearestAvailableSurgeCover(registry.actor);

      if (!isSurgeEnabledOnLevel(level.name())) {
        this.endSurge();

        return;
      }

      const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

      if (surgeDuration >= surgeConfig.DURATION) {
        if (level !== null) {
          if (level.name() === levels.zaton) {
            globalSoundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_after_surge");
          } else if (level.name() === levels.jupiter) {
            globalSoundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_after_surge");
          } else if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
            globalSoundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_after_surge");
          }
        }

        this.endSurge();
      } else {
        if (this.isAfterGameLoad) {
          if (this.isBlowoutSoundEnabled) {
            globalSoundManager.playLoopedSound(ACTOR_ID, "blowout_rumble");
          }

          if (this.isEffectorSet) {
            level.add_pp_effector(postProcessors.surge_shock, surgeConfig.SURGE_SHOCK_PP_EFFECTOR_ID, true);
          }

          if (this.isSecondMessageGiven) {
            globalSoundManager.playLoopedSound(ACTOR_ID, "surge_earthquake_sound_looped");
            level.add_cam_effector(
              animations.camera_effects_earthquake,
              surgeConfig.EARTHQUAKE_CAM_EFFECTOR_ID,
              true,
              ""
            );
          }

          this.isAfterGameLoad = false;
        }

        launchSurgeSignalRockets();

        if (this.isEffectorSet) {
          level.set_pp_effector_factor(surgeConfig.SURGE_SHOCK_PP_EFFECTOR_ID, surgeDuration / 90, 0.1);
        }

        if (this.isBlowoutSoundEnabled) {
          globalSoundManager.setLoopedSoundVolume(ACTOR_ID, "blowout_rumble", surgeDuration / 180);
        }

        if (
          surgeDuration >= 140 &&
          !this.isUiDisabled &&
          (coverObject === null || !coverObject.inside(registry.actor.position()))
        ) {
          let att: number = 1 - (185 - surgeDuration) / (185 - 140);

          att = att * att * att * 0.3;

          const surgeHit: Hit = new hit();

          surgeHit.type = hit.telepatic;
          surgeHit.power = att;
          surgeHit.impulse = 0.0;
          surgeHit.direction = createVector(0, 0, 1);
          surgeHit.draftsman = registry.actor;

          if (pickSectionFromCondList(registry.actor, null, surgeConfig.CAN_SURVIVE_SURGE) === TRUE) {
            if (registry.actor.health <= surgeHit.power) {
              surgeHit.power = registry.actor.health - 0.05;
              if (surgeHit.power < 0) {
                surgeHit.power = 0;
              }
            }
          }

          registry.actor.hit(surgeHit);
        }

        if (surgeDuration >= 185 && !this.isUiDisabled) {
          killAllSurgeUnhidden();
          this.isUiDisabled = true;
        } else if (surgeDuration >= 140 && !this.isSecondMessageGiven) {
          if (level !== null) {
            if (level.name() === levels.zaton) {
              globalSoundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_2");
            } else if (level.name() === levels.jupiter) {
              globalSoundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_phase_2");
            } else if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
              globalSoundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_surge_phase_2");
            }
          }

          globalSoundManager.playLoopedSound(ACTOR_ID, "surge_earthquake_sound_looped");
          level.add_cam_effector(
            animations.camera_effects_earthquake,
            surgeConfig.EARTHQUAKE_CAM_EFFECTOR_ID,
            true,
            ""
          );
          this.isSecondMessageGiven = true;
        } else if (surgeDuration >= 100 && !this.isEffectorSet) {
          level.add_pp_effector(postProcessors.surge_shock, surgeConfig.SURGE_SHOCK_PP_EFFECTOR_ID, true);
          // --                level.set_pp_effector_factor(surge_shock_pp_eff, 0, 10)
          this.isEffectorSet = true;
        } else if (surgeDuration >= 35 && !this.isBlowoutSoundEnabled) {
          globalSoundManager.playSound(ACTOR_ID, "blowout_begin");
          globalSoundManager.playLoopedSound(ACTOR_ID, "blowout_rumble");
          globalSoundManager.setLoopedSoundVolume(ACTOR_ID, "blowout_rumble", 0.25);
          this.isBlowoutSoundEnabled = true;
        } else if (surgeDuration >= 0 && !this.isTaskGiven) {
          if (level.name() === levels.zaton) {
            globalSoundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_1");
          } else if (level.name() === levels.jupiter) {
            globalSoundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_phase_1");
          } else if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
            globalSoundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_surge_phase_1");
          }

          level.set_weather_fx("fx_surge_day_3");
          this.giveSurgeHideTask();
        }
      }
    }
  }

  /**
   * Handle actor item use.
   * Mainly to intercept and properly handle anabiotic.
   */
  public onActorUseItem(object: Optional<ClientObject>): void {
    if (object === null) {
      return;
    }

    const serverObject: Optional<ServerObject> = registry.simulator.object(object.id());
    const serverItemSection: Optional<TInventoryItem> = serverObject?.section_name() as Optional<TInventoryItem>;

    if (serverItemSection === drugs.drug_anabiotic) {
      logger.info("On actor anabiotic use:", object.name());
      this.processAnabioticItemUsage();
    }
  }

  /**
   * Handle actor taking artefacts.
   */
  public onActorItemTake(object: ClientObject): void {
    if (isArtefact(object)) {
      logger.info("On artefact take:", object.name());

      const anomalyZone: Optional<AnomalyZoneBinder> = registry.artefacts.parentZones.get(object.id());

      if (anomalyZone !== null) {
        anomalyZone.onArtefactTaken(object);
      } else {
        registry.artefacts.ways.delete(object.id());
      }

      object.get_artefact().FollowByPath("NULL", 0, createVector(500, 500, 500));
    }
  }

  /**
   * On actor network spawn initialize covers for related location.
   */
  public onActorNetworkSpawn(): void {
    initializeSurgeCovers();
  }

  /**
   * todo: Description.
   */
  public onSurgeSurviveStart(): void {
    level.add_cam_effector(
      animations.camera_effects_surge_01,
      surgeConfig.SLEEP_CAM_EFFECTOR_ID,
      false,
      "engine.surge_survive_end"
    );
  }

  /**
   * todo: Description.
   */
  public onSurgeSurviveEnd(): void {
    ActorInputManager.getInstance().enableGameUi();
  }

  /**
   * todo: Description.
   */
  public onAnabioticSleep(): void {
    level.add_cam_effector(animations.camera_effects_surge_01, 10, false, "engine.on_anabiotic_wake_up");

    const random: number = math.random(35, 45);
    const surgeManager: SurgeManager = SurgeManager.getInstance();

    if (surgeConfig.IS_STARTED) {
      const timeFactor: TRate = level.get_time_factor();
      const timeDiffInSeconds: TDuration = math.ceil(
        game.get_game_time().diffSec(surgeManager.initializedAt) / timeFactor
      );

      if (random > ((surgeConfig.DURATION - timeDiffInSeconds) * timeFactor) / 60) {
        surgeConfig.IS_TIME_FORWARDED = true;
        surgeManager.isUiDisabled = true;
        killAllSurgeUnhidden();
        surgeManager.endSurge();
      }
    }

    level.change_game_time(0, 0, random);
    WeatherManager.getInstance().forceWeatherChange();
  }

  /**
   * todo: Description.
   */
  public onAnabioticWakeUp(): void {
    ActorInputManager.getInstance().enableGameUi();

    executeConsoleCommand(consoleCommands.snd_volume_music, registry.sounds.musicVolume);
    executeConsoleCommand(consoleCommands.snd_volume_eff, registry.sounds.effectsVolume);

    registry.sounds.effectsVolume = 0;
    registry.sounds.musicVolume = 0;

    disableInfo(infoPortions.anabiotic_in_process);
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, SurgeManager.name);

    packet.w_bool(surgeConfig.IS_FINISHED);
    packet.w_bool(surgeConfig.IS_STARTED);
    writeTimeToPacket(packet, this.lastSurgeAt);

    if (surgeConfig.IS_STARTED) {
      writeTimeToPacket(packet, this.initializedAt);

      packet.w_bool(this.isTaskGiven);
      packet.w_bool(this.isEffectorSet);
      packet.w_bool(this.isSecondMessageGiven);
      packet.w_bool(this.isUiDisabled);
      packet.w_bool(this.isBlowoutSoundEnabled);

      packet.w_stringZ(this.surgeMessage);
      packet.w_stringZ(this.surgeTaskSection);
    }

    packet.w_u32(this.nextScheduledSurgeDelay);

    packet.w_u16(table.size(this.respawnArtefactsForLevel));

    for (const [level] of this.respawnArtefactsForLevel) {
      packet.w_stringZ(level);
    }

    closeSaveMarker(packet, SurgeManager.name);
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, SurgeManager.name);

    surgeConfig.IS_FINISHED = reader.r_bool();
    surgeConfig.IS_STARTED = reader.r_bool();

    this.lastSurgeAt = readTimeFromPacket(reader)!;

    if (surgeConfig.IS_STARTED) {
      this.initializedAt = readTimeFromPacket(reader)!;

      this.isTaskGiven = reader.r_bool();
      this.isEffectorSet = reader.r_bool();
      this.isSecondMessageGiven = reader.r_bool();
      this.isUiDisabled = reader.r_bool();
      this.isBlowoutSoundEnabled = reader.r_bool();

      this.surgeMessage = reader.r_stringZ();
      this.surgeTaskSection = reader.r_stringZ();
    }

    this.nextScheduledSurgeDelay = reader.r_u32();
    this.isAfterGameLoad = true;

    const count: TCount = reader.r_u16();

    for (const _ of $range(1, count)) {
      this.respawnArtefactsForLevel.set(reader.r_stringZ(), true);
    }

    closeLoadMarker(reader, SurgeManager.name);
  }
}
