import { Nillable, TCount, TIndex, TName, TSection } from "xray16/lib";
import { $dirname, $filename, $isNil, $isNotNil } from "xray16/macros";

import { CheckContext, ICheckResult } from "@/engine/checks/framework/core";
import { resetFlow, runFlow } from "@/engine/checks/framework/flow";
import { setInfoPortion } from "@/engine/checks/framework/world";
import {
  clearChain,
  countRequestedIndices,
  ensureArtefactRequested,
  ensureHuntOpen,
  FIRST_INDEX,
  getDialogs,
  LAST_INDEX,
  mirrorHandIn,
  resolveRequestedArtefact,
  resolveRequestedIndex,
  resolveReward,
  supplyArtefact,
  TASK_ID,
  teleportToBeard,
} from "@/engine/checks/quests/zat_b29_chain";
import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { registry } from "@/engine/core/database";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasItem } from "@/engine/core/utils/item";
import { zatB29InfopBringTable } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/**
 * Actor money recorded just before the sale, so the payout can be checked as a delta.
 */
let moneyBeforeSale: Nillable<TCount> = null;

/**
 * Name of the per-index precondition guarding the walk in phrases.
 *
 * @param index - Index of the requested artefact.
 * @returns Extern name of the matching precondition.
 */
function resolveCarriedPrecondition(index: TIndex): TName {
  return `zat_b29_actor_has_adv_task_af_${index - FIRST_INDEX + 1}`;
}

/**
 * Zaton b29, walk in sale: Beard buys an artefact that was never a quest.
 */
export function run(): ICheckResult {
  return runFlow($dirname, $filename, {
    requires: { level: "zaton" },
    steps: [
      {
        name: "carrying a wanted artefact with no task in flight",
        arrange: (context: CheckContext): void => {
          teleportToBeard(context);

          ensureHuntOpen();

          // The dialog is gated on there being no task, so an earlier walk must not leave one behind.
          setInfoPortion(infoPortions.zat_b29_adv_task_given, false);

          for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
            setInfoPortion(zatB29InfopBringTable.get(index) as TInfoPortion, false);
          }

          supplyArtefact(ensureArtefactRequested());
        },
        verify: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();
          const artefact: Nillable<TSection> = resolveRequestedArtefact();

          if ($isNil(index) || $isNil(artefact)) {
            return context.fail("artefact requested", "nothing has been diced, so no walk in phrase can match");
          }

          context.expect(
            hasInfoPortion(infoPortions.zat_b29_linker_info),
            "dialog reachable",
            "'zat_b29_linker_info' is absent, so the dialog would not open at all"
          );
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "no task in flight",
            "'zat_b29_adv_task_given' is set, so the walk in phrases are hidden behind the hand in dialog"
          );
          context.expect(
            !hasInfoPortion(infoPortions.zat_b30_barmen_under_sultan),
            "Beard still trading",
            "'zat_b30_barmen_under_sultan' is set, so Beard buys nothing"
          );

          context.expect(
            getDialogs()[resolveCarriedPrecondition(index)](registry.actor, registry.actor) === true,
            "walk in phrase offered",
            `'${resolveCarriedPrecondition(index)}' is false, so Beard is not asking about '${artefact}'`
          );
        },
        handOff: "sell the artefact to Beard, or run again and the phrase is applied for you",
      },
      {
        name: "sale mirrored, paid without a task",
        arrange: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();

          if ($isNil(index)) {
            return context.fail("mirror the sale", "nothing has been diced, there is nothing to sell");
          }

          setInfoPortion(zatB29InfopBringTable.get(index) as TInfoPortion, true);

          moneyBeforeSale = mirrorHandIn(context);
        },
        verify: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();
          const artefact: Nillable<TSection> = resolveRequestedArtefact();

          if ($isNotNil(moneyBeforeSale) && $isNotNil(index)) {
            context.expectEqual(
              registry.actor.money() - moneyBeforeSale,
              resolveReward(index, hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival)),
              "sale paid"
            );
          }

          if ($isNotNil(artefact)) {
            context.expect(!actorHasItem(artefact), "artefact taken", `'${artefact}' is still in the inventory`);
          }

          context.expect(
            $isNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
            "no task involved",
            `'${TASK_ID}' is active, so this walk took the quest route rather than the walk in sale`
          );
        },
        handOff: "run again to confirm the hunt re-arms after a sale that was never a task",
        advanceWhen: (): boolean => !hasInfoPortion(infoPortions.zat_b29_redice),
      },
      {
        name: "hunt re-armed by the redice",
        verify: (context: CheckContext): void => {
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_redice),
            "redice consumed",
            "'zat_b29_redice' is still set, so the control restrictor never went back to the dice"
          );
          context.expectEqual(countRequestedIndices(), 1, "artefacts requested by the next round");
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "still no task",
            "'zat_b29_adv_task_given' appeared, so something issued a task this walk never accepted"
          );
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
