import { game, level, task, TXR_TaskState, XR_CGameTask, XR_CPhraseDialog, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { AchievementsManager } from "@/engine/core/managers/achievements/AchievementsManager";
import { EAchievement } from "@/engine/core/managers/achievements/EAchievement";
import { sleep_cam_eff_id, SurgeManager } from "@/engine/core/managers/SurgeManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { WeatherManager } from "@/engine/core/managers/WeatherManager";
import { SchemeCutscene } from "@/engine/core/schemes/sr_cutscene/SchemeCutscene";
import * as SleepDialogModule from "@/engine/core/ui/interaction/SleepDialog";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { enableGameUi } from "@/engine/core/utils/control";
import { disableInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { animations } from "@/engine/lib/constants/animation/animations";
import { console_commands } from "@/engine/lib/constants/console_commands";
import { info_portions } from "@/engine/lib/constants/info_portions";
import { AnyCallable, AnyCallablesModule, PartialRecord, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind custom externals");

/**
 * Sleeping functionality.
 */
extern("engine.dream_callback", SleepDialogModule.dream_callback);

extern("engine.dream_callback2", SleepDialogModule.dream_callback2);

/**
 * Anabiotic functionality.
 */
extern("engine.anabiotic_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, 10, false, "engine.anabiotic_callback2");

  const rnd = math.random(35, 45);
  const surgeManager: SurgeManager = SurgeManager.getInstance();

  if (surgeManager.isStarted) {
    const tf = level.get_time_factor();
    const diff_sec = math.ceil(game.get_game_time().diffSec(surgeManager.initedTime) / tf);

    if (rnd > ((surgeConfig.DURATION - diff_sec) * tf) / 60) {
      surgeManager.isTimeForwarded = true;
      surgeManager.ui_disabled = true;
      surgeManager.kill_all_unhided();
      surgeManager.endSurge();
    }
  }

  level.change_game_time(0, 0, rnd);
  WeatherManager.getInstance().forcedWeatherChange();
});

extern("engine.anabiotic_callback2", () => {
  enableGameUi();

  executeConsoleCommand(console_commands.snd_volume_music, registry.sounds.musicVolume);
  executeConsoleCommand(console_commands.snd_volume_eff, registry.sounds.effectsVolume);

  registry.sounds.effectsVolume = 0;
  registry.sounds.musicVolume = 0;

  disableInfo(info_portions.anabiotic_in_process);
});

extern("engine.surge_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, sleep_cam_eff_id, false, "engine.surge_callback2");
});

extern("engine.surge_callback2", () => {
  enableGameUi();
});

extern("engine.task_complete", (taskId: TStringId): boolean => {
  return TaskManager.getInstance().onTaskCompleted(taskId);
});

extern("engine.task_fail", (taskId: TStringId): boolean => TaskManager.getInstance().onTaskFailed(taskId));

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
