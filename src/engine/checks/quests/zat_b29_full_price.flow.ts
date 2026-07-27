import { Nillable, TCount, TIndex, TSection } from "xray16/lib";
import { $dirname, $filename, $isNil, $isNotNil } from "xray16/macros";

import { CheckContext, ICheckResult, report } from "@/engine/checks/framework/core";
import { resetFlow, runFlow } from "@/engine/checks/framework/flow";
import { evaluateTaskState, setInfoPortion } from "@/engine/checks/framework/world";
import {
  acceptOffer,
  clearChain,
  CONTROL_ZONE,
  countRequestedIndices,
  expectTitleResolves,
  findClaimingZones,
  findRivals,
  getDialogs,
  mirrorHandIn,
  requestArtefactSpawn,
  resolveRequestedArtefact,
  resolveRequestedIndex,
  resolveReward,
  supplyArtefact,
  TASK_ID,
  teleportToBeard,
} from "@/engine/checks/quests/zat_b29_chain";
import { infoPortions } from "@/engine/constants/info_portions";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { registry } from "@/engine/core/database";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasItem } from "@/engine/core/utils/item";
import { teleportActorNearPosition } from "@/engine/core/utils/position";

/**
 * Actor money recorded just before the hand in, so the reward can be checked as a delta.
 */
let moneyBeforeHandIn: Nillable<TCount> = null;

/**
 * Zaton b29, the straight ending: the actor finds the artefact and is paid the full price.
 *
 * The only flow of the set that walks the chain's own machinery instead of forcing it - the b14 gate
 * opening the hunt, the dice picking an artefact, `sr_idle@give_task` issuing the task, the rival
 * restrictors sending both parties out, and the redice re-arming the next round. The other endings
 * start past all of that, so this is where a broken restrictor shows up.
 */
export function run(): ICheckResult {
  return runFlow($dirname, $filename, {
    requires: { level: "zaton" },
    steps: [
      {
        name: "hunt unlocked at Beard",
        arrange: (context: CheckContext): void => {
          teleportToBeard(context);

          setInfoPortion(infoPortions.zat_a2_stalker_barmen_setup, true);

          // Any of these parks the chain in `sr_idle@nil` or hides the offer behind a refusal.
          setInfoPortion(infoPortions.zat_b29_task_fail, false);
          setInfoPortion(infoPortions.zat_b29_linker_fears_actor, false);
          setInfoPortion(infoPortions.zat_b30_barmen_under_sultan, false);

          setInfoPortion(infoPortions.zat_b14_smart_terrain_open, true);
        },
        verify: (context: CheckContext): void => {
          context.expect(
            $isNotNil(registry.zones.get(CONTROL_ZONE)),
            "control restrictor online",
            `'${CONTROL_ZONE}' is not registered, so nothing will drive this chain forward`
          );
        },
        handOff:
          `close any dialog you are in - '${CONTROL_ZONE}' only opens the hunt while '!talking' holds - ` +
          `and run again`,
        advanceWhen: (): boolean => hasInfoPortion(infoPortions.zat_b29_task_start),
      },
      {
        name: "Beard explains the hunt and the dice picks an artefact",
        arrange: (): void => {
          // What `zat_a2_linker_b29_actor_info` phrase 1 gives, and the only gate on the offer dialog.
          setInfoPortion(infoPortions.zat_b29_linker_info, true);
          setInfoPortion(infoPortions.zat_b29_barmen_dialog_disable, true);
        },
        verify: (context: CheckContext): void => {
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "no task in flight",
            "'zat_b29_adv_task_given' is already set, so 'zat_a2_linker_b29_actor_get_adv_task' is closed"
          );
        },
        handOff: "run again once the control restrictor has rolled which artefact Beard wants",
        advanceWhen: (): boolean => countRequestedIndices() === 1,
      },
      {
        name: "task offered and accepted",
        arrange: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();

          if ($isNil(index)) {
            return context.fail("accept the offer", "nothing has been diced, there is no artefact to ask for");
          }

          acceptOffer(context, index);
        },
        verify: (context: CheckContext): void => {
          context.expect(
            hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "offer accepted",
            "expected the accepting phrase to set 'zat_b29_adv_task_given'"
          );
        },
        handOff: "run again once the control restrictor has handed the task over",
        advanceWhen: (): boolean => $isNotNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
      },
      {
        name: "task in the log, rivals sent after the same find",
        verify: (context: CheckContext): void => {
          context.expectEqual(evaluateTaskState(TASK_ID), null, "held open while the artefact is out there");
          expectTitleResolves(context, "with the artefact still missing");

          for (const [, rival] of findRivals()) {
            report("rival squad on the map: %s", rival.squadStoryId);
          }

          context.expectEqual(findRivals().length(), 2, "rival squads created");
        },
        handOff: "run again to place the artefact in an anomaly",
      },
      {
        name: "artefact placed in an anomaly",
        arrange: (context: CheckContext): void => {
          requestArtefactSpawn(context);
        },
        verify: (context: CheckContext): void => {
          const artefact: Nillable<TSection> = resolveRequestedArtefact();
          let overrides: TCount = 0;

          for (const [, zone] of registry.anomalyZones) {
            if (zone.hasForcedSpawnOverride) {
              overrides += 1;

              if ($isNotNil(artefact)) {
                context.expectEqual(zone.forcedArtefact, artefact, "override matches the request");
              }
            }
          }

          context.expectEqual(overrides, 1, "zones holding a forced spawn override");
        },
        handOff:
          "nothing to do here: anomaly zones stay online, so the queued artefact spawns on the zone's " +
          "next update wherever you are. Run again once it has",
        advanceWhen: (): boolean => findClaimingZones().length() > 0,
      },
      {
        name: "at the anomaly holding it",
        arrange: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();
          const zone: Nillable<AnomalyZoneBinder> = findClaimingZones().get(1);

          if ($isNil(zone)) {
            return report("no zone claims the artefact, staying put");
          }

          report("moving to '%s', which holds the artefact", zone.object.name());

          // Restrictors occupy no AI location of their own, so arrive at the nearest spot the actor can
          // actually stand rather than at the zone's own vertex.
          context.expectNoThrow(
            () => teleportActorNearPosition(zone.object.position()),
            "teleport to the anomaly",
            `teleportActorNearPosition('${zone.object.name()}')`
          );

          if ($isNotNil(index)) {
            supplyArtefact(index);
          }
        },
        verify: (context: CheckContext): void => {
          // 0 means the artefact never spawned, more than 1 means the lookup is not scoped per zone.
          context.expectEqual(findClaimingZones().length(), 1, "zones claiming the artefact");
        },
        handOff:
          "collect the artefact from the anomaly if you want to, otherwise one has been put in the " +
          "inventory for the hand in",
      },
      {
        name: "hand in opens back at Beard",
        arrange: (context: CheckContext): void => {
          teleportToBeard(context);
        },
        verify: (context: CheckContext): void => {
          const artefact: Nillable<TSection> = resolveRequestedArtefact();

          if ($isNotNil(artefact)) {
            context.expect(actorHasItem(artefact), "artefact carried", `actor is not carrying '${artefact}'`);
          }

          // Both gates the hand in dialog declares: its precondition and its `has_info`.
          context.expect(
            getDialogs().zat_b29_actor_has_adv_task_af(registry.actor, registry.actor) === true,
            "hand in branch open",
            "'zat_b29_actor_has_adv_task_af' is false, so the hand in phrase would not be offered"
          );
          context.expect(
            hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "dialog reachable",
            "'zat_b29_adv_task_given' is absent, so 'zat_a2_linker_b29_actor_give_adv_task' would not open"
          );

          // Phrase 1 is this ending. Phrase 2 replaces it once a rival has delivered, which is the
          // branch `zat_b29_undercut.flow` walks.
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival),
            "full price branch",
            "a rival already delivered, so this walk would be paid the undercut price"
          );
        },
        handOff: "hand the artefact to Beard, or run again and the replica is applied for you",
      },
      {
        name: "hand in closes the task and pays the full price",
        arrange: (context: CheckContext): void => {
          moneyBeforeHandIn = mirrorHandIn(context);
        },
        verify: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();

          // The action clears this itself, which is what opens `condlist_0` and completes the task.
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "task gate cleared",
            "expected the action to disable 'zat_b29_adv_task_given'"
          );

          if ($isNotNil(moneyBeforeHandIn) && $isNotNil(index)) {
            context.expectEqual(
              registry.actor.money() - moneyBeforeHandIn,
              resolveReward(index, false),
              "full price paid"
            );
          }

          context.expectEqual(evaluateTaskState(TASK_ID), ETaskState.COMPLETED, "state after the hand in");
        },
        handOff: "run again to confirm the completion effects and that the hunt re-arms",
        advanceWhen: (): boolean => !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
      },
      {
        name: "completion effects applied and the hunt re-armed",
        verify: (context: CheckContext): void => {
          const artefact: Nillable<TSection> = resolveRequestedArtefact();

          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival),
            "on_complete applied",
            "expected 'zat_b29_linker_take_af_from_rival' to be cleared by on_complete"
          );
          context.expect(
            $isNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
            "task closed",
            "task is still active, so the manager never deactivated it"
          );

          if ($isNotNil(artefact)) {
            context.expect(!actorHasItem(artefact), "artefact taken", `'${artefact}' is still in the inventory`);
          }

          // `sr_idle@give_task` consumes the redice and sends the chain back around, which is what
          // makes the hunt repeatable rather than a one shot.
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_redice),
            "redice consumed",
            "'zat_b29_redice' is still set, so the control restrictor never went back to the dice"
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
