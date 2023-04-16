import { game, level } from "xray16";

import { registry } from "@/engine/core/database";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements/AchievementsManager";
import { EAchievement } from "@/engine/core/managers/interaction/achievements/EAchievement";
import { SleepManager } from "@/engine/core/managers/interaction/SleepManager";
import { TaskManager } from "@/engine/core/managers/interaction/tasks";
import { sleep_cam_eff_id, SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";
import { SchemeCutscene } from "@/engine/core/schemes/sr_cutscene/SchemeCutscene";
import { extern } from "@/engine/core/utils/binding";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { enableGameUi } from "@/engine/core/utils/control";
import { disableInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { animations } from "@/engine/lib/constants/animation/animations";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { AnyCallable, PartialRecord, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind custom externals");

/**
 * On actor start sleeping.
 */
extern("engine.on_start_sleeping", () => SleepManager.getInstance().onStartSleeping());

/**
 * On actor stop sleeping.
 */
extern("engine.on_finish_sleeping", () => SleepManager.getInstance().onFinishSleeping());

/**
 * Anabiotic functionality.
 */
extern("engine.anabiotic_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, 10, false, "engine.anabiotic_callback2");

  const rnd = math.random(35, 45);
  const surgeManager: SurgeManager = SurgeManager.getInstance();

  if (surgeManager.isStarted) {
    const tf = level.get_time_factor();
    const diff_sec = math.ceil(game.get_game_time().diffSec(surgeManager.initializedAt) / tf);

    if (rnd > ((surgeConfig.DURATION - diff_sec) * tf) / 60) {
      surgeManager.isTimeForwarded = true;
      surgeManager.isUiDisabled = true;
      surgeManager.killAllUnhided();
      surgeManager.endSurge();
    }
  }

  level.change_game_time(0, 0, rnd);
  WeatherManager.getInstance().forceWeatherChange();
});

/**
 * todo;
 */
extern("engine.anabiotic_callback2", () => {
  enableGameUi();

  executeConsoleCommand(consoleCommands.snd_volume_music, registry.sounds.musicVolume);
  executeConsoleCommand(consoleCommands.snd_volume_eff, registry.sounds.effectsVolume);

  registry.sounds.effectsVolume = 0;
  registry.sounds.musicVolume = 0;

  disableInfo(infoPortions.anabiotic_in_process);
});

/**
 * todo;
 */
extern("engine.surge_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, sleep_cam_eff_id, false, "engine.surge_callback2");
});

/**
 * todo;
 */
extern("engine.surge_callback2", () => {
  enableGameUi();
});

/**
 * todo;
 */
extern("engine.is_task_completed", (taskId: TStringId): boolean => {
  return TaskManager.getInstance().isTaskCompleted(taskId);
});

/**
 * todo;
 */
extern("engine.is_task_failed", (taskId: TStringId): boolean => TaskManager.getInstance().isTaskFailed(taskId));

/**
 * todo;
 */
extern("engine.effector_callback", () => SchemeCutscene.onCutsceneEnd());

/**
 * Checkers for achievements called from C++.
 */
extern(
  "engine.check_achievement",
  Object.values(EAchievement).reduce<PartialRecord<EAchievement, AnyCallable>>((acc, it) => {
    acc[it] = () => AchievementsManager.getInstance().checkAchieved(it);

    return acc;
  }, {})
);
