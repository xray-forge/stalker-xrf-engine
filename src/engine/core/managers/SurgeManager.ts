import {
  alife,
  game,
  hit,
  level,
  TXR_net_processor,
  vector,
  XR_cse_alife_object,
  XR_CTime,
  XR_game_object,
  XR_hit,
  XR_net_packet,
} from "xray16";

import { closeLoadMarker, closeSaveMarker, openSaveMarker, registry, SURGE_MANAGER_LTX } from "@/engine/core/database";
import { portableStoreGet, portableStoreSet } from "@/engine/core/database/portable_store";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { StatisticsManager } from "@/engine/core/managers/StatisticsManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { WeatherManager } from "@/engine/core/managers/WeatherManager";
import { AnomalyZoneBinder, SmartTerrain } from "@/engine/core/objects";
import { Squad } from "@/engine/core/objects/alife/squad/Squad";
import {
  isBlackScreen,
  isImmuneToSurge,
  isObjectOnLevel,
  isSurgeEnabledOnLevel,
} from "@/engine/core/utils/check/check";
import { isArtefact, isStoryObject } from "@/engine/core/utils/check/is";
import { executeConsoleCommand, getConsoleFloatCommand } from "@/engine/core/utils/console";
import { disableGameUiOnly } from "@/engine/core/utils/control";
import { createAutoSave } from "@/engine/core/utils/game_save";
import { giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { animations } from "@/engine/lib/constants/animation/animations";
import { postProcessors } from "@/engine/lib/constants/animation/post_processors";
import { captions } from "@/engine/lib/constants/captions/captions";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import {
  LuaArray,
  Optional,
  PartialRecord,
  TCount,
  TDistance,
  TDuration,
  TLabel,
  TName,
  TNumberId,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

export const surge_shock_pp_eff_id: TNumberId = 1;
export const earthquake_cam_eff_id: TNumberId = 2;
export const sleep_cam_eff_id: TNumberId = 3;
export const sleep_fade_pp_eff_id: TNumberId = 4;

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Surge cover descriptor.
 */
export interface ISurgeCoverDescriptor {
  name: TName;
  conditionList: Optional<TConditionList>;
}

/**
 * todo;
 * todo: Separate manager to handle artefacts spawn / ownership etc in parallel, do not mix logic.
 */
export class SurgeManager extends AbstractCoreManager {
  public respawnArtefactsByLevel: PartialRecord<TLevel, boolean> = {
    [levels.zaton]: false,
    [levels.jupiter]: false,
    [levels.pripyat]: false,
  };

  public isStarted: boolean = false;
  public isFinished: boolean = true;
  public isTimeForwarded: boolean = false;
  public isEffectorSet: boolean = false;
  public isAfterGameLoad: boolean = false;
  public isUiDisabled: boolean = false;
  public isTaskGiven: boolean = false;
  public isSecondMessageGiven: boolean = false;
  public isSkipMessageToggled: boolean = false;
  public isBlowoutSoundEnabled: boolean = false;

  public prev_sec: TTimestamp = 0;

  public initializedAt: XR_CTime = game.CTime();
  public lastSurgeAt: XR_CTime = game.get_game_time();

  /**
   * Delay of next surge happening.
   * Next surge is timestamp is `lastTimestamp + delay`.
   */
  public nextScheduledSurgeDelay: TDuration = math.random(
    surgeConfig.INTERVAL_BETWEEN_SURGES.MIN_ON_FIRST_TIME,
    surgeConfig.INTERVAL_BETWEEN_SURGES.MAX_ON_FIRST_TIME
  );

  public surgeManagerConditionList: TConditionList = new LuaTable();
  public surgeSurviveConditionList: TConditionList = new LuaTable();

  public surgeMessage: TLabel = "";
  public surgeTaskSection: TSection = "";

  /**
   * List of available covers for level.
   */
  private surgeCovers: LuaArray<ISurgeCoverDescriptor> = new LuaTable();

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_NET_SPAWN, this.onActorNetworkSpawn, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_USE_ITEM, this.onActorUseItem, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake, this);

    if (SURGE_MANAGER_LTX.line_exist("settings", "condlist")) {
      this.surgeManagerConditionList = parseConditionsList(SURGE_MANAGER_LTX.r_string("settings", "condlist"));
    } else {
      this.surgeManagerConditionList = parseConditionsList(TRUE);
    }

    if (SURGE_MANAGER_LTX.line_exist("settings", "survive")) {
      this.surgeSurviveConditionList = parseConditionsList(SURGE_MANAGER_LTX.r_string("settings", "survive"));
    } else {
      this.surgeSurviveConditionList = parseConditionsList(FALSE);
    }
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_NET_SPAWN, this.onActorNetworkSpawn);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_USE_ITEM, this.onActorUseItem);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake);
  }

  /**
   * todo: Description.
   */
  public initializeSurgeCovers(): void {
    logger.info("Initialize surge covers");
    this.surgeCovers = new LuaTable();

    const levelName: TLevel = level.name();

    if (!SURGE_MANAGER_LTX.section_exist(levelName)) {
      return logger.info("No surge covers for current level:", levelName);
    }

    // Read list of possible surge covers for current level.
    for (const index of $range(0, SURGE_MANAGER_LTX.line_count(levelName) - 1)) {
      const [_, name] = SURGE_MANAGER_LTX.r_line(levelName, index, "", "");

      // Collect covers names + condition lists if declared.
      table.insert(this.surgeCovers, {
        name,
        conditionList: SURGE_MANAGER_LTX.line_exist(name, "condlist")
          ? parseConditionsList(SURGE_MANAGER_LTX.r_string(name, "condlist"))
          : null,
      });
    }

    logger.info("Initialized surge covers:", levelName, this.surgeCovers.length());
  }

  /**
   * todo: Description.
   */
  public getNearestAvailableCover(): Optional<XR_game_object> {
    const actor: XR_game_object = registry.actor;

    let nearestCover: Optional<XR_game_object> = null;
    let nearestCoverDistance: TDistance = MAX_U32;

    /**
     * Check if cover can be actually used and then mark as possible cover.
     * - Alarms
     * - Quest conditions
     * - Blocked by different conditions
     */
    for (const [index, descriptor] of this.surgeCovers) {
      const object: Optional<XR_game_object> = registry.zones.get(descriptor.name);

      if (object !== null) {
        const isValidCover: boolean =
          descriptor.conditionList === null || pickSectionFromCondList(actor, null, descriptor.conditionList) === TRUE;

        // If already somehow inside cover, mark as nearest and active.
        if (object.inside(actor.position())) {
          return object;
        }

        // Check distance only if cover is valid, and it makes sense to travel to it.
        if (isValidCover) {
          const distanceSqr: TDistance = object.position().distance_to_sqr(actor.position());

          if (distanceSqr < nearestCoverDistance) {
            nearestCover = object;
            nearestCoverDistance = distanceSqr;
          }
        }
      }
    }

    return nearestCover;
  }

  /**
   * todo: Description.
   */
  public isActorInCover(): boolean {
    return this.getNearestAvailableCover()?.inside(registry.actor.position()) === true;
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
  public getTargetCover(): Optional<XR_game_object> {
    const coverObject: Optional<XR_game_object> = this.getNearestAvailableCover();

    // No covers or already in cover -> nothing to do.
    if (coverObject === null || coverObject.inside(registry.actor.position())) {
      return null;
    } else {
      return coverObject;
    }
  }

  /**
   * todo: Description.
   */
  public isKillingAll(): boolean {
    return this.isStarted && this.isUiDisabled;
  }

  private canReleaseSquad(squad: Squad): boolean {
    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const smartTerrain: Optional<SmartTerrain> = squad.smart_id
      ? (simulationBoardManager.getSmartTerrainDescriptorById(squad.smart_id)?.smartTerrain as Optional<SmartTerrain>)
      : null;

    return smartTerrain !== null && tonumber(smartTerrain.props["surge"])! <= 0;
  }

  /**
   * Return list of game objects representing possible covers.
   */
  public getCoverObjects(): LuaArray<XR_game_object> {
    const covers: LuaArray<XR_game_object> = new LuaTable();

    for (const [, descriptor] of this.surgeCovers) {
      const object: Optional<XR_game_object> = registry.zones.get(descriptor.name);

      if (object !== null) {
        table.insert(covers, object);
      }
    }

    return covers;
  }

  /**
   * todo: Description.
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
   * todo: Description.
   */
  public requestSurgeStop(): void {
    logger.info("Request surge stop");

    if (this.isStarted) {
      this.endSurge(true);
    }
  }

  /**
   * Start surge.
   */
  protected start(isForced?: boolean): void {
    logger.info("Surge start");

    const [Y, M, D, h, m, s, ms] = this.lastSurgeAt.get(0, 0, 0, 0, 0, 0, 0);

    if (isForced) {
      this.initializedAt = game.get_game_time();
    } else {
      this.initializedAt.set(Y, M, D, h, m, s + this.nextScheduledSurgeDelay, ms);
    }

    const diffSec: TDuration = math.ceil(game.get_game_time().diffSec(this.initializedAt) / level.get_time_factor());

    if (!isSurgeEnabledOnLevel(level.name())) {
      this.isSkipMessageToggled = true;
      this.skipSurge();

      return;
    }

    if (diffSec + 6 > surgeConfig.DURATION) {
      this.skipSurge();
    } else {
      this.isStarted = true;
      this.isFinished = false;

      if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end) || hasAlifeInfo(infoPortions.pri_a28_actor_in_zone_stay)) {
        createAutoSave(captions.st_save_uni_surge_start);
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

    this.isStarted = false;
    this.isFinished = true;
    this.respawnArtefactsByLevel = { zaton: true, jupiter: true, pripyat: true };
    this.nextScheduledSurgeDelay = math.random(
      surgeConfig.INTERVAL_BETWEEN_SURGES.MIN,
      surgeConfig.INTERVAL_BETWEEN_SURGES.MAX
    );
    this.surgeMessage = "";
    this.surgeTaskSection = "";
    this.isTaskGiven = false;

    this.isEffectorSet = false;
    this.isSecondMessageGiven = false;
    this.isUiDisabled = false;
    this.isBlowoutSoundEnabled = false;
    this.prev_sec = 0;

    this.respawnArtefactsAndReplaceAnomalyZones();

    StatisticsManager.getInstance().incrementSurgesCount();
    EventsManager.getInstance().emitEvent(EGameEvent.SURGE_SKIPPED, !this.isSkipMessageToggled);

    this.isSkipMessageToggled = true;
  }

  /**
   * todo: Description.
   */
  public endSurge(manual?: boolean): void {
    logger.info("Ending surge:", manual);

    this.isStarted = false;
    this.isFinished = true;
    this.respawnArtefactsByLevel = { zaton: true, jupiter: true, pripyat: true };
    this.lastSurgeAt = game.get_game_time();
    this.nextScheduledSurgeDelay = math.random(
      surgeConfig.INTERVAL_BETWEEN_SURGES.MIN,
      surgeConfig.INTERVAL_BETWEEN_SURGES.MAX
    );
    this.surgeMessage = "";
    this.surgeTaskSection = "";
    this.isTaskGiven = false;

    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (this.isEffectorSet) {
      globalSoundManager.stopLoopedSound(registry.actor.id(), "blowout_rumble");
    }

    if (this.isSecondMessageGiven) {
      globalSoundManager.stopLoopedSound(registry.actor.id(), "surge_earthquake_sound_looped");
    }

    level.remove_pp_effector(surge_shock_pp_eff_id);
    level.remove_cam_effector(earthquake_cam_eff_id);

    if (manual || (this.isTimeForwarded && WeatherManager.getInstance().weatherFx)) {
      level.stop_weather_fx();
      WeatherManager.getInstance().forceWeatherChange();
    }

    this.isEffectorSet = false;
    this.isSecondMessageGiven = false;
    this.isUiDisabled = false;
    this.isBlowoutSoundEnabled = false;
    this.prev_sec = 0;

    for (const [, signalLight] of registry.signalLights) {
      logger.info("Stop signal light");
      signalLight.stopLight();
      signalLight.stop();
    }

    if (this.isAfterGameLoad) {
      this.killAllUnhided();
    }

    this.respawnArtefactsAndReplaceAnomalyZones();

    StatisticsManager.getInstance().incrementSurgesCount();
    EventsManager.getInstance().emitEvent(EGameEvent.SURGE_ENDED);
  }

  /**
   * todo: Description.
   */
  public killAllUnhided(): void {
    logger.info("Kill all surge unhided");

    const surgeHit: XR_hit = new hit();

    surgeHit.type = hit.fire_wound;
    surgeHit.power = 0.9;
    surgeHit.impulse = 0.0;
    surgeHit.direction = new vector().set(0, 0, 1);
    surgeHit.draftsman = registry.actor;

    logger.info("Kill crows");

    for (const [, id] of registry.crows.storage) {
      const object: Optional<XR_game_object> = registry.objects.get(id)?.object;

      if (object.alive()) {
        object.hit(surgeHit);
      }
    }

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const levelName: TLevel = level.name();
    const surgeCovers: LuaArray<XR_game_object> = this.getCoverObjects();

    logger.info("Releasing squads:", simulationBoardManager.getSquads().length());

    for (const [squadId, squad] of simulationBoardManager.getSquads()) {
      if (isObjectOnLevel(squad, levelName) && !isImmuneToSurge(squad) && !isStoryObject(squad)) {
        for (const member of squad.squad_members()) {
          if (!isStoryObject(member.object)) {
            if (this.canReleaseSquad(squad)) {
              logger.info("Releasing npc from squad because of surge:", member.object.name(), squad.name());

              const clientObject: Optional<XR_game_object> = level.object_by_id(member.object.id);

              if (clientObject === null) {
                member.object.kill();
              } else {
                clientObject.kill(clientObject);
              }
            } else {
              let release = true;

              // Check if is in cover.
              for (const [, coverObject] of surgeCovers) {
                if (coverObject.inside(member.object.position)) {
                  release = false;
                  break;
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

    const coverObject: Optional<XR_game_object> = this.getNearestAvailableCover();

    if (registry.actor.alive()) {
      if (!coverObject?.inside(registry.actor.position())) {
        if (hasAlifeInfo(infoPortions.anabiotic_in_process)) {
          const counterName: TName = "actor_marked_by_zone_cnt";
          const counterValue: TCount = portableStoreGet(registry.actor, counterName, 0);

          portableStoreSet(registry.actor, counterName, counterValue + 1);
        }

        disableGameUiOnly(registry.actor);

        if (pickSectionFromCondList(registry.actor, null, this.surgeSurviveConditionList) !== TRUE) {
          this.killAllUnhidedAfterActorDeath();
          registry.actor.kill(registry.actor);

          return;
        } else {
          level.add_cam_effector(animations.camera_effects_surge_02, sleep_cam_eff_id, false, "engine.surge_callback");
          level.add_pp_effector(postProcessors.surge_fade, sleep_fade_pp_eff_id, false);
          registry.actor.health = registry.actor.health - 0.05;
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  protected killAllUnhidedAfterActorDeath(): void {
    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const levelName: TLevel = level.name();

    const activeCovers: LuaArray<XR_game_object> = this.getCoverObjects();

    for (const [squadId, squad] of simulationBoardManager.getSquads()) {
      if (isObjectOnLevel(squad, levelName) && !isImmuneToSurge(squad)) {
        for (const member of squad.squad_members()) {
          let isInCover: boolean = false;

          for (const [, coverObject] of activeCovers) {
            if (coverObject.inside(member.object.position)) {
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

            const clientObject: Optional<XR_game_object> = level.object_by_id(member.object.id);

            // todo: What is the difference here?
            if (clientObject === null) {
              member.object.kill();
            } else {
              clientObject.kill(clientObject);
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
    const levelName: TLevel = level.name();

    if (this.respawnArtefactsByLevel[levelName]) {
      this.respawnArtefactsByLevel[levelName] = false;
    }

    for (const [, anomalyZone] of registry.anomalies) {
      anomalyZone.respawnArtefactsAndReplaceAnomalyZones();
    }

    MapDisplayManager.getInstance().updateAnomalyZonesDisplay();
  }

  /**
   * todo: Description.
   */
  public processAnabioticItemUsage(): void {
    disableGameUiOnly(registry.actor);

    level.add_cam_effector(animations.camera_effects_surge_02, 10, false, "engine.anabiotic_callback");
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
  protected giveSurgeHideTask(): void {
    if (this.surgeTaskSection !== "empty") {
      TaskManager.getInstance().giveTask(this.surgeTaskSection === "" ? "hide_from_surge" : this.surgeTaskSection);

      this.isTaskGiven = true;
    }
  }

  /**
   * todo: Description.
   */
  protected launchSignalRockets(): void {
    logger.info("Launch signal light rockets");

    for (const [, signalLight] of registry.signalLights) {
      logger.info("Start signal light");
      if (!signalLight.isFlying()) {
        signalLight.launch();
      }
    }
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    if (isBlackScreen()) {
      return;
    }

    if (this.respawnArtefactsByLevel[level.name() as TLevel]) {
      this.respawnArtefactsAndReplaceAnomalyZones();
    }

    if (!this.isStarted) {
      const currentGameTime: XR_CTime = game.get_game_time();

      if (this.isTimeForwarded) {
        const diff = math.abs(this.nextScheduledSurgeDelay - currentGameTime.diffSec(this.lastSurgeAt));

        if (diff < surgeConfig.INTERVAL_BETWEEN_SURGES.POST_TF_DELAY_MIN) {
          logger.info("Time forward, reschedule from:", this.nextScheduledSurgeDelay);

          this.nextScheduledSurgeDelay =
            surgeConfig.INTERVAL_BETWEEN_SURGES.POST_TF_DELAY_MAX + currentGameTime.diffSec(this.lastSurgeAt);

          logger.info("Time forward, reschedule to:", this.nextScheduledSurgeDelay);
        }

        this.isTimeForwarded = false;
      }

      if (currentGameTime.diffSec(this.lastSurgeAt) < this.nextScheduledSurgeDelay) {
        return;
      }

      if (pickSectionFromCondList(registry.actor, null, this.surgeManagerConditionList) !== TRUE) {
        return;
      }

      if (!this.getNearestAvailableCover()) {
        return;
      }

      return this.start();
    }

    const surgeDuration: TDuration = math.ceil(
      game.get_game_time().diffSec(this.initializedAt) / level.get_time_factor()
    );

    if (this.prev_sec !== surgeDuration) {
      this.prev_sec = surgeDuration;

      const coverObject: Optional<XR_game_object> = this.getNearestAvailableCover();

      if (!isSurgeEnabledOnLevel(level.name())) {
        this.endSurge();

        return;
      }

      const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

      if (surgeDuration >= surgeConfig.DURATION) {
        if (level !== null) {
          if (level.name() === levels.zaton) {
            globalSoundManager.playSound(registry.actor.id(), "zat_a2_stalker_barmen_after_surge", null, null);
          } else if (level.name() === levels.jupiter) {
            globalSoundManager.playSound(registry.actor.id(), "jup_a6_stalker_medik_after_surge", null, null);
          } else if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
            globalSoundManager.playSound(registry.actor.id(), "pri_a17_kovalsky_after_surge", null, null);
          }
        }

        this.endSurge();
      } else {
        if (this.isAfterGameLoad) {
          if (this.isBlowoutSoundEnabled) {
            globalSoundManager.playLoopedSound(registry.actor.id(), "blowout_rumble");
          }

          if (this.isEffectorSet) {
            level.add_pp_effector(postProcessors.surge_shock, surge_shock_pp_eff_id, true);
          }

          if (this.isSecondMessageGiven) {
            globalSoundManager.playLoopedSound(registry.actor.id(), "surge_earthquake_sound_looped");
            level.add_cam_effector(animations.camera_effects_earthquake, earthquake_cam_eff_id, true, "");
          }

          this.isAfterGameLoad = false;
        }

        this.launchSignalRockets();
        if (this.isEffectorSet) {
          level.set_pp_effector_factor(surge_shock_pp_eff_id, surgeDuration / 90, 0.1);
        }

        if (this.isBlowoutSoundEnabled) {
          globalSoundManager.setLoopedSoundVolume(registry.actor.id(), "blowout_rumble", surgeDuration / 180);
        }

        if (
          surgeDuration >= 140 &&
          !this.isUiDisabled &&
          (coverObject === null || !coverObject.inside(registry.actor.position()))
        ) {
          let att: number = 1 - (185 - surgeDuration) / (185 - 140);

          att = att * att * att * 0.3;

          const surgeHit: XR_hit = new hit();

          surgeHit.type = hit.telepatic;
          surgeHit.power = att;
          surgeHit.impulse = 0.0;
          surgeHit.direction = new vector().set(0, 0, 1);
          surgeHit.draftsman = registry.actor;

          if (pickSectionFromCondList(registry.actor, null, this.surgeSurviveConditionList) === TRUE) {
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
          this.killAllUnhided();
          this.isUiDisabled = true;
        } else if (surgeDuration >= 140 && !this.isSecondMessageGiven) {
          if (level !== null) {
            if (level.name() === levels.zaton) {
              globalSoundManager.playSound(registry.actor.id(), "zat_a2_stalker_barmen_surge_phase_2", null, null);
            } else if (level.name() === levels.jupiter) {
              globalSoundManager.playSound(registry.actor.id(), "jup_a6_stalker_medik_phase_2", null, null);
            } else if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
              globalSoundManager.playSound(registry.actor.id(), "pri_a17_kovalsky_surge_phase_2", null, null);
            }
          }

          globalSoundManager.playLoopedSound(registry.actor.id(), "surge_earthquake_sound_looped");
          level.add_cam_effector(animations.camera_effects_earthquake, earthquake_cam_eff_id, true, "");
          this.isSecondMessageGiven = true;
        } else if (surgeDuration >= 100 && !this.isEffectorSet) {
          level.add_pp_effector(postProcessors.surge_shock, surge_shock_pp_eff_id, true);
          // --                level.set_pp_effector_factor(surge_shock_pp_eff, 0, 10)
          this.isEffectorSet = true;
        } else if (surgeDuration >= 35 && !this.isBlowoutSoundEnabled) {
          globalSoundManager.playSound(registry.actor.id(), "blowout_begin", null, null);
          globalSoundManager.playLoopedSound(registry.actor.id(), "blowout_rumble");
          globalSoundManager.setLoopedSoundVolume(registry.actor.id(), "blowout_rumble", 0.25);
          this.isBlowoutSoundEnabled = true;
        } else if (surgeDuration >= 0 && !this.isTaskGiven) {
          if (level.name() === levels.zaton) {
            globalSoundManager.playSound(registry.actor.id(), "zat_a2_stalker_barmen_surge_phase_1", null, null);
          } else if (level.name() === levels.jupiter) {
            globalSoundManager.playSound(registry.actor.id(), "jup_a6_stalker_medik_phase_1", null, null);
          } else if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
            globalSoundManager.playSound(registry.actor.id(), "pri_a17_kovalsky_surge_phase_1", null, null);
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
  public onActorUseItem(object: Optional<XR_game_object>): void {
    if (object === null) {
      return;
    }

    const serverObject: Optional<XR_cse_alife_object> = alife().object(object.id());
    const serverItemSection: Optional<TInventoryItem> = serverObject?.section_name() as Optional<TInventoryItem>;

    if (serverItemSection === drugs.drug_anabiotic) {
      logger.info("On actor anabiotic use:", object.name());
      this.processAnabioticItemUsage();
    }
  }

  /**
   * Handle actor taking artefacts.
   */
  public onActorItemTake(object: XR_game_object): void {
    if (isArtefact(object)) {
      logger.info("On artefact take:", object.name());

      const anomalyZone: Optional<AnomalyZoneBinder> = registry.artefacts.parentZones.get(object.id());

      if (anomalyZone !== null) {
        anomalyZone.onArtefactTaken(object);
      } else {
        registry.artefacts.ways.delete(object.id());
      }

      object.get_artefact().FollowByPath("NULL", 0, new vector().set(500, 500, 500));

      StatisticsManager.getInstance().incrementCollectedArtefactsCount(object);
    }
  }

  /**
   * On actor network spawn initialize covers for related location.
   */
  public onActorNetworkSpawn(): void {
    this.initializeSurgeCovers();
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, SurgeManager.name);

    packet.w_bool(this.isFinished);
    packet.w_bool(this.isStarted);
    writeTimeToPacket(packet, this.lastSurgeAt);

    if (this.isStarted) {
      writeTimeToPacket(packet, this.initializedAt);

      packet.w_bool(this.respawnArtefactsByLevel.zaton as boolean);
      packet.w_bool(this.respawnArtefactsByLevel.jupiter as boolean);
      packet.w_bool(this.respawnArtefactsByLevel.pripyat as boolean);

      packet.w_bool(this.isTaskGiven);
      packet.w_bool(this.isEffectorSet);
      packet.w_bool(this.isSecondMessageGiven);
      packet.w_bool(this.isUiDisabled);
      packet.w_bool(this.isBlowoutSoundEnabled);

      packet.w_stringZ(this.surgeMessage);
      packet.w_stringZ(this.surgeTaskSection);
    }

    packet.w_u32(this.nextScheduledSurgeDelay);

    closeSaveMarker(packet, SurgeManager.name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: TXR_net_processor): void {
    openLoadMarker(reader, SurgeManager.name);

    this.isFinished = reader.r_bool();
    this.isStarted = reader.r_bool();
    this.lastSurgeAt = readTimeFromPacket(reader)!;

    if (this.isStarted) {
      this.initializedAt = readTimeFromPacket(reader)!;

      this.respawnArtefactsByLevel.zaton = reader.r_bool();
      this.respawnArtefactsByLevel.jupiter = reader.r_bool();
      this.respawnArtefactsByLevel.pripyat = reader.r_bool();

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

    closeLoadMarker(reader, SurgeManager.name);
  }
}
