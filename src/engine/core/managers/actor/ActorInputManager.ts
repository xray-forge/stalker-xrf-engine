import { game, get_hud, level } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManagerInstanceByName,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import type { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { killAllSurgeUnhidden } from "@/engine/core/managers/surge/utils/surge_kill";
import { WeatherManager } from "@/engine/core/managers/weather";
import { executeConsoleCommand, getConsoleFloatCommand } from "@/engine/core/utils/console";
import { disableInfoPortion, giveInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActorInNoWeaponZone } from "@/engine/core/utils/position";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { animations, postProcessors } from "@/engine/lib/constants/animation";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { misc } from "@/engine/lib/constants/items/misc";
import {
  ClientObject,
  EActiveItemSlot,
  GameHud,
  NetPacket,
  NetProcessor,
  Optional,
  ServerObject,
  TDuration,
  Time,
  TIndex,
  TRate,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle actor input.
 */
export class ActorInputManager extends AbstractManager {
  public isWeaponHidden: boolean = false;
  public isWeaponHiddenInDialog: boolean = false;
  public isActorNightVisionEnabled: boolean = false;
  public isActorTorchEnabled: boolean = false;

  public activeItemSlot: EActiveItemSlot = EActiveItemSlot.PRIMARY;
  public memoizedItemSlot: EActiveItemSlot = EActiveItemSlot.NONE;

  public disableInputAt: Optional<Time> = null;
  public disableInputDuration: Optional<TDuration> = null;

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_FIRST_UPDATE, this.onFirstUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_ONLINE, this.onActorGoOnline, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_USE_ITEM, this.onActorUseItem, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.onUpdate);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_FIRST_UPDATE, this.onFirstUpdate);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_ONLINE, this.onActorGoOnline);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_USE_ITEM, this.onActorUseItem);
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, ActorInputManager.name);

    if (this.disableInputAt === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeTimeToPacket(packet, this.disableInputAt);
    }

    packet.w_u8(registry.actor.active_slot());
    closeSaveMarker(packet, ActorInputManager.name);
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, ActorInputManager.name);

    if (reader.r_bool()) {
      this.disableInputAt = readTimeFromPacket(reader);
    }

    this.activeItemSlot = reader.r_u8();
    closeLoadMarker(reader, ActorInputManager.name);
  }

  /**
   * Disable game input for delta duration.
   */
  public setInactiveInputTime(duration: TDuration): void {
    logger.format("Deactivate actor input: '%s'", duration);

    this.disableInputAt = game.get_game_time();
    this.disableInputDuration = duration;

    level.disable_input();
  }

  /**
   * todo;
   */
  public disableActorNightVision(): void {
    logger.info("Disable actor night vision");

    const nightVision: Optional<ClientObject> = registry.actor.object(misc.device_torch);

    if (nightVision !== null && nightVision.night_vision_enabled()) {
      nightVision.enable_night_vision(false);
      this.isActorNightVisionEnabled = false;
    }
  }

  /**
   * todo;
   */
  public enableActorNightVision(): void {
    logger.info("Enable actor night vision");

    const nightVision: Optional<ClientObject> = registry.actor.object(misc.device_torch);

    if (nightVision !== null && !nightVision.night_vision_enabled() && !this.isActorNightVisionEnabled) {
      nightVision.enable_night_vision(true);
      this.isActorNightVisionEnabled = true;
    }
  }

  /**
   * todo;
   */
  public disableActorTorch(): void {
    logger.info("Disable actor torch");

    const torch: Optional<ClientObject> = registry.actor.object(misc.device_torch);

    if (torch !== null && torch.torch_enabled()) {
      torch.enable_torch(false);
      this.isActorTorchEnabled = false;
    }
  }

  /**
   * todo;
   */
  public enableActorTorch(): void {
    logger.info("Enable actor torch");

    const torch: Optional<ClientObject> = registry.actor.object(misc.device_torch);

    if (torch !== null && !torch.torch_enabled() && !this.isActorTorchEnabled) {
      torch.enable_torch(true);
      this.isActorTorchEnabled = true;
    }
  }

  /**
   * todo;
   */
  public disableGameUi(resetSlot: boolean = false): void {
    logger.info("Disable game UI");

    const actor: ClientObject = registry.actor;

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.show_weapon(false);

    if (resetSlot) {
      const slot: TIndex = actor.active_slot();

      if (slot !== EActiveItemSlot.NONE) {
        this.memoizedItemSlot = slot;
        actor.activate_slot(EActiveItemSlot.NONE);
      }
    }

    level.disable_input();
    level.hide_indicators_safe();

    const hud: GameHud = get_hud();

    hud.HideActorMenu();
    hud.HidePdaMenu();

    this.disableActorNightVision();
    this.disableActorTorch();
  }

  /**
   * todo;
   */
  public enableGameUi(restore: boolean = false): void {
    logger.info("Enable game UI");

    if (restore) {
      if (
        this.memoizedItemSlot !== EActiveItemSlot.NONE &&
        registry.actor.item_in_slot(this.memoizedItemSlot) !== null
      ) {
        registry.actor.activate_slot(this.memoizedItemSlot);
      }
    }

    this.memoizedItemSlot = EActiveItemSlot.NONE;

    level.show_weapon(true);
    level.enable_input();
    level.show_indicators();

    this.enableActorNightVision();
    this.enableActorTorch();
  }

  /**
   * todo;
   */
  public disableGameUiOnly(): void {
    logger.info("Disable game UI only");

    const actor: ClientObject = registry.actor;

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.show_weapon(false);

    const slot: TIndex = actor.active_slot();

    if (slot !== EActiveItemSlot.NONE) {
      this.memoizedItemSlot = slot;
      actor.activate_slot(EActiveItemSlot.NONE);
    }

    level.disable_input();
    level.hide_indicators_safe();

    const hud: GameHud = get_hud();

    hud.HideActorMenu();
    hud.HidePdaMenu();
  }

  /**
   * todo: Description.
   */
  public processAnabioticItemUsage(): void {
    ActorInputManager.getInstance().disableGameUiOnly();

    level.add_cam_effector(animations.camera_effects_surge_02, 10, false, "engine.on_anabiotic_sleep");
    level.add_pp_effector(postProcessors.surge_fade, 11, false);

    giveInfoPortion(infoPortions.anabiotic_in_process);

    registry.musicVolume = getConsoleFloatCommand(consoleCommands.snd_volume_music);
    registry.effectsVolume = getConsoleFloatCommand(consoleCommands.snd_volume_eff);

    executeConsoleCommand(consoleCommands.snd_volume_music, 0);
    executeConsoleCommand(consoleCommands.snd_volume_eff, 0);
  }

  /**
   * Handle generic update from actor input perspective.
   */
  public onUpdate(delta: TDuration): void {
    const actor: ClientObject = registry.actor;

    if (
      this.disableInputAt !== null &&
      game.get_game_time().diffSec(this.disableInputAt) >= (this.disableInputDuration as number)
    ) {
      logger.info("Enabling actor game input");
      level.enable_input();
      this.disableInputAt = null;
    }

    if (actor.is_talking()) {
      if (!this.isWeaponHiddenInDialog) {
        logger.info("Hiding weapon in dialog");
        actor.hide_weapon();
        this.isWeaponHiddenInDialog = true;
      }
    } else {
      if (this.isWeaponHiddenInDialog) {
        logger.info("Restoring weapon in dialog");
        actor.restore_weapon();
        this.isWeaponHiddenInDialog = false;
      }
    }

    if (isActorInNoWeaponZone()) {
      if (!this.isWeaponHidden) {
        logger.info("Hiding weapon");
        actor.hide_weapon();
        this.isWeaponHidden = true;
      }
    } else {
      if (this.isWeaponHidden) {
        logger.info("Restoring weapon");
        actor.restore_weapon();
        this.isWeaponHidden = false;
      }
    }
  }

  /**
   * Handle first update from actor input perspective.
   */
  public onFirstUpdate(): void {
    logger.info("Apply active item slot:", this.activeItemSlot);
    registry.actor.activate_slot(this.activeItemSlot);
  }

  /**
   * Handle actor network spawn.
   */
  public onActorGoOnline(): void {
    if (this.disableInputAt === null) {
      level.enable_input();
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
   * todo: Description.
   */
  public onAnabioticSleep(): void {
    level.add_cam_effector(animations.camera_effects_surge_01, 10, false, "engine.on_anabiotic_wake_up");

    const random: number = math.random(35, 45);
    const surgeManager: SurgeManager = getManagerInstanceByName("SurgeManager") as SurgeManager;

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

    executeConsoleCommand(consoleCommands.snd_volume_music, registry.musicVolume);
    executeConsoleCommand(consoleCommands.snd_volume_eff, registry.effectsVolume);

    registry.effectsVolume = 0;
    registry.musicVolume = 0;

    disableInfoPortion(infoPortions.anabiotic_in_process);
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
    this.enableGameUi();
  }
}
