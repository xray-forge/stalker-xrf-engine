import { game, get_hud, level } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManagerInstanceByName,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
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
  EActiveItemSlot,
  GameHud,
  GameObject,
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

    if (actorConfig.DISABLED_INPUT_AT === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeTimeToPacket(packet, actorConfig.DISABLED_INPUT_AT);
    }

    packet.w_u8(registry.actor.active_slot());
    closeSaveMarker(packet, ActorInputManager.name);
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, ActorInputManager.name);

    if (reader.r_bool()) {
      actorConfig.DISABLED_INPUT_AT = readTimeFromPacket(reader);
    }

    actorConfig.ACTIVE_ITEM_SLOT = reader.r_u8();
    closeLoadMarker(reader, ActorInputManager.name);
  }

  /**
   * Disable game input for delta duration.
   */
  public setInactiveInputTime(duration: TDuration): void {
    logger.format("Deactivate actor input: '%s'", duration);

    actorConfig.DISABLED_INPUT_AT = game.get_game_time();
    actorConfig.DISABLED_INPUT_DURATION = duration;

    level.disable_input();
  }

  /**
   * todo;
   */
  public disableActorNightVision(): void {
    logger.info("Disable actor night vision");

    const nightVision: Optional<GameObject> = registry.actor.object(misc.device_torch);

    if (nightVision !== null && nightVision.night_vision_enabled()) {
      nightVision.enable_night_vision(false);
      actorConfig.IS_ACTOR_NIGHT_VISION_ENABLED = false;
    }
  }

  /**
   * todo;
   */
  public enableActorNightVision(): void {
    logger.info("Enable actor night vision");

    const nightVision: Optional<GameObject> = registry.actor.object(misc.device_torch);

    if (nightVision !== null && !nightVision.night_vision_enabled() && !actorConfig.IS_ACTOR_NIGHT_VISION_ENABLED) {
      nightVision.enable_night_vision(true);
      actorConfig.IS_ACTOR_NIGHT_VISION_ENABLED = true;
    }
  }

  /**
   * todo;
   */
  public disableActorTorch(): void {
    logger.info("Disable actor torch");

    const torch: Optional<GameObject> = registry.actor.object(misc.device_torch);

    if (torch !== null && torch.torch_enabled()) {
      torch.enable_torch(false);
      actorConfig.IS_ACTOR_TORCH_ENABLED = false;
    }
  }

  /**
   * todo;
   */
  public enableActorTorch(): void {
    logger.info("Enable actor torch");

    const torch: Optional<GameObject> = registry.actor.object(misc.device_torch);

    if (torch !== null && !torch.torch_enabled() && !actorConfig.IS_ACTOR_TORCH_ENABLED) {
      torch.enable_torch(true);
      actorConfig.IS_ACTOR_TORCH_ENABLED = true;
    }
  }

  /**
   * todo;
   */
  public disableGameUi(resetSlot: boolean = false): void {
    logger.info("Disable game UI");

    const actor: GameObject = registry.actor;

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.show_weapon(false);

    if (resetSlot) {
      const slot: TIndex = actor.active_slot();

      if (slot !== EActiveItemSlot.NONE) {
        actorConfig.MEMOIZED_ITEM_SLOT = slot;
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
        actorConfig.MEMOIZED_ITEM_SLOT !== EActiveItemSlot.NONE &&
        registry.actor.item_in_slot(actorConfig.MEMOIZED_ITEM_SLOT) !== null
      ) {
        registry.actor.activate_slot(actorConfig.MEMOIZED_ITEM_SLOT);
      }
    }

    actorConfig.MEMOIZED_ITEM_SLOT = EActiveItemSlot.NONE;

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

    const actor: GameObject = registry.actor;

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.show_weapon(false);

    const slot: TIndex = actor.active_slot();

    if (slot !== EActiveItemSlot.NONE) {
      actorConfig.MEMOIZED_ITEM_SLOT = slot;
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
    const actor: GameObject = registry.actor;

    if (
      actorConfig.DISABLED_INPUT_AT !== null &&
      game.get_game_time().diffSec(actorConfig.DISABLED_INPUT_AT) >= (actorConfig.DISABLED_INPUT_DURATION as number)
    ) {
      logger.info("Enabling actor game input");
      level.enable_input();
      actorConfig.DISABLED_INPUT_AT = null;
    }

    if (actor.is_talking()) {
      if (!actorConfig.IS_WEAPON_HIDDEN_IN_DIALOG) {
        logger.info("Hiding weapon in dialog");
        actor.hide_weapon();
        actorConfig.IS_WEAPON_HIDDEN_IN_DIALOG = true;
      }
    } else {
      if (actorConfig.IS_WEAPON_HIDDEN_IN_DIALOG) {
        logger.info("Restoring weapon in dialog");
        actor.restore_weapon();
        actorConfig.IS_WEAPON_HIDDEN_IN_DIALOG = false;
      }
    }

    if (isActorInNoWeaponZone()) {
      if (!actorConfig.IS_WEAPON_HIDDEN) {
        logger.info("Hiding weapon");
        actor.hide_weapon();
        actorConfig.IS_WEAPON_HIDDEN = true;
      }
    } else {
      if (actorConfig.IS_WEAPON_HIDDEN) {
        logger.info("Restoring weapon");
        actor.restore_weapon();
        actorConfig.IS_WEAPON_HIDDEN = false;
      }
    }
  }

  /**
   * Handle first update from actor input perspective.
   */
  public onFirstUpdate(): void {
    logger.info("Apply active item slot:", actorConfig.ACTIVE_ITEM_SLOT);
    registry.actor.activate_slot(actorConfig.ACTIVE_ITEM_SLOT);
  }

  /**
   * Handle actor network spawn.
   */
  public onActorGoOnline(): void {
    if (actorConfig.DISABLED_INPUT_AT === null) {
      level.enable_input();
    }
  }

  /**
   * Handle actor item use.
   * Mainly to intercept and properly handle anabiotic.
   */
  public onActorUseItem(object: Optional<GameObject>): void {
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
