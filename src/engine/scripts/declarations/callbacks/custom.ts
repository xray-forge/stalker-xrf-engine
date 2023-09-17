import { EAchievement } from "@/engine/core/managers/achievements/achievements_types";
import { AchievementsManager } from "@/engine/core/managers/achievements/AchievementsManager";
import { SleepManager } from "@/engine/core/managers/sleep";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { SchemeCutscene } from "@/engine/core/schemes/restrictor/sr_cutscene/SchemeCutscene";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
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
 * On anabiotic used and start sleeping.
 */
extern("engine.on_anabiotic_sleep", () => SurgeManager.getInstance().onAnabioticSleep());

/**
 * On anabiotic used and stop sleeping.
 */
extern("engine.on_anabiotic_wake_up", () => SurgeManager.getInstance().onAnabioticWakeUp());

/**
 * On surviving surge start sleeping.
 */
extern("engine.surge_survive_start", () => SurgeManager.getInstance().onSurgeSurviveStart());

/**
 * On surviving surge stop sleeping.
 */
extern("engine.surge_survive_end", () => SurgeManager.getInstance().onSurgeSurviveEnd());

/**
 * Check whether task with provided ID is completed.
 */
extern("engine.is_task_completed", (taskId: TStringId): boolean => TaskManager.getInstance().isTaskCompleted(taskId));

/**
 * Check whether task with provided ID is failed.
 */
extern("engine.is_task_failed", (taskId: TStringId): boolean => TaskManager.getInstance().isTaskFailed(taskId));

/**
 * Callback of game effector.
 * When some camera effects from cutscene ends, handle it in scheme.
 *
 * todo: rename to camera_effector_callback?
 */
extern("engine.effector_callback", () => SchemeCutscene.onCutsceneEnd());

/**
 * Checkers for achievements called from C++.
 * Creates set of callbacks in generic way.
 */
extern(
  "engine.check_achievement",
  Object.values(EAchievement).reduce<PartialRecord<EAchievement, AnyCallable>>((acc, it) => {
    const manager: AchievementsManager = AchievementsManager.getInstance();

    acc[it] = () => manager.checkAchieved(it);

    return acc;
  }, {})
);
