import { $dirname, $filename, $isNil } from "xray16/macros";

import { CheckContext, ICheckResult } from "@/engine/checks/framework/core";
import { resetFlow, runFlow } from "@/engine/checks/framework/flow";
import { evaluateTaskState, setInfoPortion } from "@/engine/checks/framework/world";
import {
  acceptOffer,
  clearChain,
  countRequestedIndices,
  ensureArtefactRequested,
  ensureHuntOpen,
  ensureTaskGiven,
  expectTitleResolves,
  TASK_ID,
  teleportToBeard,
} from "@/engine/checks/quests/zat_b29_chain";
import { infoPortions } from "@/engine/constants/info_portions";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Zaton b29, reversed: the hunt runs out before the actor delivers.
 */
export function run(): ICheckResult {
  return runFlow($dirname, $filename, {
    requires: { level: "zaton" },
    steps: [
      {
        name: "hunt in flight",
        arrange: (context: CheckContext): void => {
          teleportToBeard(context);

          ensureHuntOpen();
          acceptOffer(context, ensureArtefactRequested());
          ensureTaskGiven();
        },
        verify: (context: CheckContext): void => {
          context.expectEqual(evaluateTaskState(TASK_ID), null, "held open before anything expires");
          expectTitleResolves(context, "with the hunt still running");
        },
        handOff: "run again to let the hunt expire",
      },
      {
        name: "the deadline passes",
        arrange: (): void => {
          setInfoPortion(infoPortions.zat_b29_adv_task_timeout, true);
        },
        verify: (context: CheckContext): void => {
          context.expectEqual(evaluateTaskState(TASK_ID), ETaskState.REVERSED, "state once the deadline passes");
        },
        handOff: "run again to confirm what on_reversed cleans up",
        advanceWhen: (): boolean => !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
      },
      {
        name: "on_reversed applied and the hunt re-armed",
        verify: (context: CheckContext): void => {
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_timeout),
            "timeout cleared",
            "'zat_b29_adv_task_timeout' survived on_reversed, so the next task would expire instantly"
          );
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "task gate cleared",
            "'zat_b29_adv_task_given' survived on_reversed, so Beard would not offer the hunt again"
          );
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival),
            "undercut flag cleared",
            "'zat_b29_linker_take_af_from_rival' survived on_reversed"
          );

          context.expect(
            $isNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
            "task closed",
            "task is still active, so the manager never deactivated it"
          );

          context.expectEqual(countRequestedIndices(), 1, "artefacts requested by the next round");
        },
      },
    ],
  });
}

/**
 * Send the flow back to its first step, and the chain back to its start gate.
 */
export function reset(): void {
  clearChain();
  resetFlow($dirname, $filename);
}
