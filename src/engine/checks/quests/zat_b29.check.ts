import { AnyCallablesModule, getExtern, LuaArray, Nillable, TCount, TIndex, TName, TStringId } from "xray16/lib";
import { $dirname, $filename, $fromArray, $isNotNil } from "xray16/macros";

import { runCheck } from "@/engine/checks/framework/check";
import { CheckContext, ICheckResult } from "@/engine/checks/framework/core";
import { forceTaskEvaluation, giveFreshTask, setInfoPortion } from "@/engine/checks/framework/world";
import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { getManager, SYSTEM_INI } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import {
  zatB29AfNamesTable,
  zatB29AfTable,
  zatB29InfopBringTable,
  zatB29InfopTable,
} from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/** Task under check. */
const TASK_ID: TStringId = "zat_b29_adv_task";
/** Index range the four b29 lookup tables are keyed on. */
const FIRST_INDEX: TIndex = 16;
const LAST_INDEX: TIndex = 23;
/**  Artefact variant the check pins the quest to, so the title and description functors resolve. */
const PINNED_INDEX: TIndex = FIRST_INDEX;

/**
 * Anomaly zones the b29 chain draws its artefact from.
 */
const ANOMALY_ZONES: LuaArray<TName> = $fromArray<TName>([
  "zat_b55_anomal_zone",
  "zat_b54_anomal_zone",
  "zat_b53_anomal_zone",
]);

/**
 * Evaluate the task from the current portion state.
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
 * Assert the negated completion gate and the side effect applied on completion.
 *
 * `condlist_0` is `{-zat_b29_adv_task_given} complete`, so the task completes when the portion is
 * absent. A check that only ever adds portions would never catch that inversion being reversed.
 */
function checkTaskGate(context: CheckContext): void {
  const taskGiven: TInfoPortion = infoPortions.zat_b29_adv_task_given;
  const taskTimeout: TInfoPortion = infoPortions.zat_b29_adv_task_timeout;
  const takeFromRival: TInfoPortion = infoPortions.zat_b29_linker_take_af_from_rival;

  context.stage("held open while the task is given", () => {
    setInfoPortion(taskTimeout, false);
    setInfoPortion(taskGiven, true);
    context.expectEqual(evaluateState(), null, "state");
  });

  context.stage("completes once the task is no longer given", () => {
    setInfoPortion(taskTimeout, false);
    setInfoPortion(taskGiven, false);
    context.expectEqual(evaluateState(), ETaskState.COMPLETED, "state");
  });

  context.stage("reverses on timeout", () => {
    setInfoPortion(taskGiven, true);
    setInfoPortion(taskTimeout, true);
    context.expectEqual(evaluateState(), ETaskState.REVERSED, "state");
  });

  context.stage("on_complete clears the rival pickup", () => {
    setInfoPortion(taskTimeout, false);
    setInfoPortion(taskGiven, false);
    setInfoPortion(takeFromRival, true);

    context.expectEqual(evaluateState(), ETaskState.COMPLETED, "state before side effects");

    const task: Nillable<TaskObject> = taskConfig.ACTIVE_TASKS.get(TASK_ID);

    if ($isNotNil(task) && $isNotNil(task.task)) {
      // `on_complete` is applied on deactivation rather than on evaluation, so drive it explicitly.
      task.onDeactivate(task.task);
      context.expect(
        !hasInfoPortion(takeFromRival),
        "rival pickup disabled",
        "expected 'zat_b29_linker_take_af_from_rival' to be disabled on completion"
      );
    } else {
      context.fail("rival pickup disabled", "task object or its game task was missing");
    }
  });
}

/**
 * Assert the four parallel lookup tables stay aligned and reference real sections.
 *
 * The chain indexes all four by the same key, so a single missing entry silently breaks artefact
 * selection with no error anywhere.
 */
function checkLookupTables(context: CheckContext): void {
  context.stage("lookup tables aligned on 16..23", () => {
    for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
      const section: Nillable<TName> = zatB29AfTable.get(index);

      context.expect($isNotNil(section), "af table entry", `zatB29AfTable is missing index ${index}`);
      context.expect(
        $isNotNil(zatB29AfNamesTable.get(index)),
        "af names table entry",
        `zatB29AfNamesTable is missing index ${index}`
      );
      context.expect(
        $isNotNil(zatB29InfopTable.get(index)),
        "infop table entry",
        `zatB29InfopTable is missing index ${index}`
      );
      context.expect(
        $isNotNil(zatB29InfopBringTable.get(index)),
        "infop bring table entry",
        `zatB29InfopBringTable is missing index ${index}`
      );

      if ($isNotNil(section)) {
        context.expect(
          SYSTEM_INI.section_exist(section),
          "af section exists",
          `artefact section '${section}' at index ${index} is not defined in system ini`
        );
      }
    }
  });
}

/**
 * Assert the artefact lookup condition is scoped to the zone it is asked about.
 */
function checkAnomalyCondition(context: CheckContext): void {
  const conditions: AnyCallablesModule = getExtern<AnyCallablesModule>("xr_conditions");

  context.stage("unknown zone reports false", () => {
    context.expect(
      conditions.zat_b29_anomaly_has_af(null, null, ["zat_b00_not_a_real_zone"]) === false,
      "result",
      "an unregistered anomaly zone must not report an artefact"
    );
  });

  context.stage("anomaly lookup survives every real zone", () => {
    for (const [, zoneName] of ANOMALY_ZONES) {
      context.expectNoThrow(
        () => conditions.zat_b29_anomaly_has_af(null, null, [zoneName]),
        "lookup",
        `zat_b29_anomaly_has_af('${zoneName}')`
      );
    }
  });

  context.stage("artefact claimed by at most one zone", () => {
    let claiming: TCount = 0;

    for (const [, zoneName] of ANOMALY_ZONES) {
      if (conditions.zat_b29_anomaly_has_af(null, null, [zoneName]) === true) {
        claiming += 1;
      }
    }

    context.expect(
      claiming <= 1,
      "zones claiming",
      `${claiming} zones reported holding the wanted artefact, the lookup is not scoped per zone`
    );
  });
}

/**
 * Zaton b29 advanced task chain: rival stalkers racing the actor for an anomaly artefact.
 *
 * Needs Zaton loaded, because the anomaly lookup reads zone binders which only exist for the
 * current level.
 */
export function run(): ICheckResult {
  return runCheck($dirname, $filename, {
    requires: { level: "zaton" },
    setup: (): void => {
      for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
        setInfoPortion(zatB29InfopBringTable.get(index) as TInfoPortion, index === PINNED_INDEX);
      }
    },
    body: (context: CheckContext): void => {
      checkTaskGate(context);
      checkLookupTables(context);
      checkAnomalyCondition(context);
    },
  });
}
