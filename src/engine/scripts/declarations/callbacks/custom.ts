import { getManager } from "@/engine/core/database";
import { EAchievement } from "@/engine/core/managers/achievements/achievements_types";
import { AchievementsManager } from "@/engine/core/managers/achievements/AchievementsManager";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { SleepManager } from "@/engine/core/managers/sleep";
import { taskConfig } from "@/engine/core/managers/tasks";
import { emitCutsceneEndedEvent } from "@/engine/core/schemes/restrictor/sr_cutscene/utils";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyCallable, PartialRecord, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind custom externals");

/**
 * On actor start sleeping.
 */
extern("engine.on_start_sleeping", () => getManager(SleepManager).onStartSleeping());

/**
 * On actor stop sleeping.
 */
extern("engine.on_finish_sleeping", () => getManager(SleepManager).onFinishSleeping());

/**
 * On anabiotic used and start sleeping.
 */
extern("engine.on_anabiotic_sleep", () => getManager(ActorInputManager).onAnabioticSleep());

/**
 * On anabiotic used and stop sleeping.
 */
extern("engine.on_anabiotic_wake_up", () => getManager(ActorInputManager).onAnabioticWakeUp());

/**
 * On surviving surge start sleeping.
 */
extern("engine.surge_survive_start", () => getManager(ActorInputManager).onSurgeSurviveStart());

/**
 * On surviving surge stop sleeping.
 */
extern("engine.surge_survive_end", () => getManager(ActorInputManager).onSurgeSurviveEnd());

/**
 * Check whether task with provided ID is completed.
 */
extern("engine.is_task_completed", (taskId: TStringId): boolean => taskConfig.ACTIVE_TASKS.get(taskId)?.isCompleted());

/**
 * Check whether task with provided ID is failed.
 */
extern("engine.is_task_failed", (taskId: TStringId): boolean => taskConfig.ACTIVE_TASKS.get(taskId)?.isFailed());

/**
 * Callback of game effector.
 * When some camera effects from cutscene ends, handle it in scheme.
 *
 * todo: rename to camera_effector_callback?
 */
extern("engine.effector_callback", () => emitCutsceneEndedEvent());

/**
 * Checkers for achievements called from C++.
 * Creates set of callbacks in generic way.
 */
extern(
  "engine.check_achievement",
  Object.values(EAchievement).reduce<PartialRecord<EAchievement, AnyCallable>>((acc, it) => {
    const manager: AchievementsManager = getManager(AchievementsManager);

    acc[it] = () => manager.checkAchieved(it);

    return acc;
  }, {})
);
