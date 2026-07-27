import { AnyCallablesModule, getExtern } from "xray16/lib";
import { $dirname, $filename, $isNil } from "xray16/macros";

import { CheckContext, ICheckResult, report } from "@/engine/checks/framework/core";
import { resetFlow, runFlow } from "@/engine/checks/framework/flow";
import { evaluateTaskState, setInfoPortion } from "@/engine/checks/framework/world";
import {
  acceptOffer,
  clearChain,
  countRequestedIndices,
  ensureArtefactRequested,
  ensureHuntOpen,
  ensureTaskGiven,
  findRivals,
  TASK_ID,
  teleportToBeard,
} from "@/engine/checks/quests/zat_b29_chain";
import { infoPortions } from "@/engine/constants/info_portions";
import { registry } from "@/engine/core/database";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * @returns Whether the chain has written both rivals off.
 */
function areBothRivalsTakenOut(): boolean {
  return (
    hasInfoPortion(infoPortions.zat_b29_first_rival_taken_out) &&
    hasInfoPortion(infoPortions.zat_b29_second_rival_taken_out)
  );
}

/**
 * Zaton b29, lockout: turn on the rivals and Beard stops offering the hunt.
 */
export function run(): ICheckResult {
  return runFlow($dirname, $filename, {
    requires: { level: "zaton" },
    steps: [
      {
        name: "hunt in flight, rivals on the map",
        arrange: (context: CheckContext): void => {
          teleportToBeard(context);

          ensureHuntOpen();

          // Without these cleared the lockout either cannot be reached or was already reached.
          setInfoPortion(infoPortions.zat_b29_first_rival_taken_out, false);
          setInfoPortion(infoPortions.zat_b29_second_rival_taken_out, false);
          setInfoPortion(infoPortions.zat_b29_respawn, false);
          setInfoPortion(infoPortions.zat_b29_exclusive_conditions, false);

          acceptOffer(context, ensureArtefactRequested());
          ensureTaskGiven();
        },
        verify: (context: CheckContext): void => {
          context.expectEqual(evaluateTaskState(TASK_ID), null, "held open while the rivals are still friendly");
        },
        handOff: "run again once both rival squads are on the map",
        advanceWhen: (): boolean => findRivals().length() === 2,
      },
      {
        name: "both parties turned on",
        arrange: (context: CheckContext): void => {
          const effects: AnyCallablesModule = getExtern<AnyCallablesModule>("xr_effects");

          for (const [, rival] of findRivals()) {
            report("turning '%s' hostile", rival.squadStoryId);

            context.expectNoThrow(
              () => effects.set_squad_enemy_to_actor(registry.actor, registry.actor, [rival.squadStoryId]),
              "turn the rivals hostile",
              `xr_effects.set_squad_enemy_to_actor('${rival.squadStoryId}')`
            );
          }
        },
        verify: (context: CheckContext): void => {
          context.expectEqual(findRivals().length(), 2, "rival squads still on the map");
        },
        handOff:
          "both parties are hostile now - finish them or just stay clear, either way run again once " +
          "the control restrictor has written both off",
        advanceWhen: (): boolean => areBothRivalsTakenOut(),
      },
      {
        name: "hunt closed out with nothing delivered",
        arrange: (): void => {
          setInfoPortion(infoPortions.zat_b29_adv_task_timeout, true);
        },
        verify: (context: CheckContext): void => {
          context.expect(
            areBothRivalsTakenOut(),
            "both rivals written off",
            "one of the write off portions is missing, so the chain will dice again instead of locking"
          );
          context.expectEqual(evaluateTaskState(TASK_ID), ETaskState.REVERSED, "state once the hunt expires");
        },
        handOff: "run again once the control restrictor has reacted",
        advanceWhen: (): boolean => hasInfoPortion(infoPortions.zat_b29_linker_fears_actor),
      },
      {
        name: "Beard will not offer it again",
        verify: (context: CheckContext): void => {
          context.expect(
            hasInfoPortion(infoPortions.zat_b29_linker_fears_actor),
            "lockout applied",
            "expected 'sr_idle@create_random_task_af' to set 'zat_b29_linker_fears_actor'"
          );

          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "no task in flight",
            "'zat_b29_adv_task_given' is set, so something issued a hunt after the lockout"
          );
          context.expect(
            $isNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
            "task closed",
            "task is still active, so the manager never deactivated it"
          );

          context.expectEqual(countRequestedIndices(), 0, "artefacts requested after the lockout");
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
