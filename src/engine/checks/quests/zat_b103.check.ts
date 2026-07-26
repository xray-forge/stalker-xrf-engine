import { Nillable, TStringId } from "xray16/lib";
import { $dirname, $filename } from "xray16/macros";

import { runCheck } from "@/engine/checks/framework/check";
import { CheckContext, ICheckResult } from "@/engine/checks/framework/core";
import { forceTaskEvaluation, giveFreshTask, setInfoPortion } from "@/engine/checks/framework/world";
import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { getManager } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { ETaskState } from "@/engine/core/managers/tasks/types";

/**
 * Task under check.
 */
const TASK_ID: TStringId = "zat_b103_merc_bring_supplies";

/**
 * Evaluate the task from the current portion state and report its raw settled state.
 *
 * `isTaskFailed` collapses `fail` and `reversed` into one answer, so the raw state is read directly
 * to tell them apart. That distinction is the point of this chain.
 *
 * @returns Settled task state, or null when no gate matched.
 */
function evaluateState(): Nillable<ETaskState> {
  giveFreshTask(TASK_ID);
  forceTaskEvaluation(TASK_ID);
  getManager(TaskManager).isTaskCompleted(TASK_ID);

  return taskConfig.ACTIVE_TASKS.get(TASK_ID)?.state;
}

/**
 * Zaton b103 mercenary supplies chain.
 *
 * The only chain here reaching the `fail` state. Portion gated, so it runs on any level.
 */
export function run(): ICheckResult {
  return runCheck($dirname, $filename, {
    body: (context: CheckContext): void => {
      const taskDone: TInfoPortion = infoPortions.zat_b103_merc_task_done;
      const mercFight: TInfoPortion = infoPortions.zat_b103_merc_fight;

      context.stage("settles on neither gate", () => {
        setInfoPortion(taskDone, false);
        setInfoPortion(mercFight, false);
        context.expectEqual(evaluateState(), null, "state");
      });

      context.stage("completes when supplies are delivered", () => {
        setInfoPortion(taskDone, true);
        setInfoPortion(mercFight, false);
        context.expectEqual(evaluateState(), ETaskState.COMPLETED, "state");
      });

      context.stage("fails when the mercenaries turn hostile", () => {
        setInfoPortion(taskDone, false);
        setInfoPortion(mercFight, true);
        context.expectEqual(evaluateState(), ETaskState.FAIL, "state");
      });

      context.stage("complete precedes fail when both gates are satisfied", () => {
        setInfoPortion(taskDone, true);
        setInfoPortion(mercFight, true);
        context.expectEqual(evaluateState(), ETaskState.COMPLETED, "state");
      });
    },
  });
}
