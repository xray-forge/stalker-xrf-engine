import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SurgeManager } from "@/engine/core/managers/SurgeManager";
import { WeatherManager } from "@/engine/core/managers/WeatherManager";
import { SleepDialog } from "@/engine/core/ui/interaction/SleepDialog";
import { executeConsoleCommand, getConsoleFloatCommand } from "@/engine/core/utils/console";
import { disableGameUi, enableGameUi } from "@/engine/core/utils/control";
import { disableInfo, giveInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { animations } from "@/engine/lib/constants/animation/animations";
import { postProcessors } from "@/engine/lib/constants/animation/post_processors";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { Optional, TDuration } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manage sleep process of the actor.
 */
export class SleepManager extends AbstractCoreManager {
  /**
   * Sleep dialog UI component.
   */
  private sleepDialog: Optional<SleepDialog> = null;

  /**
   * Duration of next sleep.
   */
  private nextSleepDuration: TDuration = 0;

  /**
   * Show sleep dialog.
   */
  public showSleepDialog(): void {
    if (this.sleepDialog === null) {
      this.sleepDialog = new SleepDialog(this);
    }

    this.sleepDialog.timeTrack.SetCurrentValue();
    this.sleepDialog.TestAndShow();
  }

  /**
   * Start sleeping and related animations.
   */
  public startSleep(hours: TDuration): void {
    logger.info("Start sleep for:", hours);

    this.nextSleepDuration = hours;

    disableGameUi(registry.actor);

    level.add_cam_effector(animations.camera_effects_sleep, 10, false, "engine.on_start_sleeping");
    level.add_pp_effector(postProcessors.sleep_fade, 11, false);

    giveInfo(infoPortions.actor_is_sleeping);

    registry.sounds.musicVolume = getConsoleFloatCommand(consoleCommands.snd_volume_music);
    registry.sounds.effectsVolume = getConsoleFloatCommand(consoleCommands.snd_volume_eff);

    executeConsoleCommand(consoleCommands.snd_volume_music, 0);
    executeConsoleCommand(consoleCommands.snd_volume_eff, 0);

    SurgeManager.getInstance().setSkipResurrectMessage();
  }

  /**
   * Start sleeping animation.
   */
  public onStartSleeping(): void {
    logger.info("On start sleeping");

    level.add_cam_effector(animations.camera_effects_sleep, 10, false, "engine.on_finish_sleeping");

    const weatherManager: WeatherManager = WeatherManager.getInstance();
    const surgeManager: SurgeManager = SurgeManager.getInstance();

    level.change_game_time(0, this.nextSleepDuration, 0);

    weatherManager.forceWeatherChange();
    surgeManager.isTimeForwarded = true;

    if (surgeManager.isStarted && weatherManager.weatherFx) {
      level.stop_weather_fx();
      weatherManager.forceWeatherChange();
    }

    registry.actor.power = 1;

    EventsManager.getInstance().emitEvent(EGameEvent.ACTOR_START_SLEEP);
  }

  /**
   * Wake up from sleep and show UI.
   */
  public onFinishSleeping(): void {
    logger.info("On finish sleeping");

    enableGameUi();

    executeConsoleCommand(consoleCommands.snd_volume_music, registry.sounds.musicVolume);
    executeConsoleCommand(consoleCommands.snd_volume_eff, registry.sounds.effectsVolume);

    registry.sounds.musicVolume = 0;
    registry.sounds.effectsVolume = 0;

    giveInfo(infoPortions.tutorial_sleep);
    disableInfo(infoPortions.actor_is_sleeping);
    disableInfo(infoPortions.sleep_active);

    EventsManager.getInstance().emitEvent(EGameEvent.ACTOR_FINISH_SLEEP);
  }
}
