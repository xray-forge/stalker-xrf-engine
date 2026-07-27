import { GameObject, ServerObject } from "xray16/alias";
import { Nillable, TCount, TIndex, TSection } from "xray16/lib";
import { $dirname, $filename, $isNil, $isNotNil } from "xray16/macros";

import { CheckContext, ICheckResult, report } from "@/engine/checks/framework/core";
import { resetFlow, runFlow } from "@/engine/checks/framework/flow";
import { evaluateTaskState, setInfoPortion } from "@/engine/checks/framework/world";
import {
  acceptOffer,
  clearChain,
  ensureArtefactRequested,
  ensureHuntOpen,
  findRivals,
  getDialogs,
  getRivalSquad,
  IRivalDescriptor,
  mirrorHandIn,
  resolveRequestedArtefact,
  resolveRequestedIndex,
  resolveReward,
  TASK_ID,
  teleportToBeard,
} from "@/engine/checks/quests/zat_b29_chain";
import { infoPortions } from "@/engine/constants/info_portions";
import { detectors } from "@/engine/constants/items/detectors";
import { TWeapon, weapons } from "@/engine/constants/items/weapons";
import { getObjectByStoryId, registry } from "@/engine/core/database";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasItem, objectHasItem } from "@/engine/core/utils/item";
import { teleportActorNearPosition } from "@/engine/core/utils/position";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { getGoodGunsInInventory } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/** Weapon spawned for the trade when the actor carries nothing the rivals want. */
const FALLBACK_TRADE_GUN: TWeapon = weapons.wpn_vintorez;

/**
 * Actor money recorded just before the hand in, so the reward can be checked as a delta.
 */
let moneyBeforeHandIn: Nillable<TCount> = null;

/**
 * @returns The rival party this walk trades with, or null while none are on the map.
 */
function resolveTradingRival(): Nillable<IRivalDescriptor> {
  return findRivals().get(1);
}

/**
 * Zaton b29, undercut: the rivals get there first and the hand in pays a tier less.
 */
export function run(): ICheckResult {
  return runFlow($dirname, $filename, {
    requires: { level: "zaton" },
    steps: [
      {
        name: "hunt in flight, rivals sent out",
        arrange: (context: CheckContext): void => {
          teleportToBeard(context);

          ensureHuntOpen();

          // A rival killed in an earlier walk is never replaced while these hold.
          setInfoPortion(infoPortions.zat_b29_first_rival_taken_out, false);
          setInfoPortion(infoPortions.zat_b29_second_rival_taken_out, false);

          // `zat_b29_sr_rival_1` and `_2` create their squads on this portion alone.
          acceptOffer(context, ensureArtefactRequested());
        },
        verify: (context: CheckContext): void => {
          context.expect(
            hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "hunt in flight",
            "expected accepting the offer to set 'zat_b29_adv_task_given'"
          );
        },
        handOff: "run again once both rival squads are on the map",
        advanceWhen: (): boolean => findRivals().length() === 2,
      },
      {
        name: "at the rivals, carrying detectors",
        arrange: (context: CheckContext): void => {
          const rival: Nillable<IRivalDescriptor> = resolveTradingRival();
          const squad: Nillable<ServerObject> = $isNotNil(rival) ? getRivalSquad(rival) : null;

          if ($isNil(rival) || $isNil(squad)) {
            report("no rival squad to travel to, staying put");
          } else {
            report("moving to '%s'", rival.squadStoryId);

            // Squads roam offline, so their position comes from the server object, not a binder.
            context.expectNoThrow(
              () => teleportActorNearPosition(squad.position),
              "teleport to the rivals",
              `teleportActorNearPosition('${rival.squadStoryId}')`
            );
          }

          if (getGoodGunsInInventory(registry.actor).length() === 0) {
            report("actor carries nothing the rivals would trade for, spawning '%s'", FALLBACK_TRADE_GUN);
            spawnItemsForObject(registry.actor, FALLBACK_TRADE_GUN, 1);
          }
        },
        verify: (context: CheckContext): void => {
          const rival: Nillable<IRivalDescriptor> = resolveTradingRival();

          if ($isNil(rival)) {
            return context.fail("rivals present", "no rival squad is on the map");
          }

          const leader: Nillable<GameObject> = getObjectByStoryId(rival.leaderStoryId);

          if ($isNil(leader)) {
            return report("'%s' is still offline, detectors cannot be checked yet", rival.leaderStoryId);
          }

          context.expect(
            objectHasItem(leader, detectors.detector_advanced) ||
              objectHasItem(leader, detectors.detector_elite) ||
              objectHasItem(leader, detectors.detector_scientific),
            "leader carries a detector",
            `'${rival.leaderStoryId}' has no detector, so nothing armed the rivals for the hunt`
          );
        },
        handOff: "walk up to the rivals so they come online, then run again",
        advanceWhen: (): boolean => {
          const rival: Nillable<IRivalDescriptor> = resolveTradingRival();

          return $isNotNil(rival) && $isNotNil(getObjectByStoryId(rival.leaderStoryId));
        },
      },
      {
        name: "rivals found it first",
        arrange: (context: CheckContext): void => {
          const rival: Nillable<IRivalDescriptor> = resolveTradingRival();

          if ($isNil(rival)) {
            return context.fail("rivals found it", "no rival squad is on the map");
          }

          const artefact: Nillable<TSection> = resolveRequestedArtefact();

          // The trade phrase only opens while the actor is empty handed: its precondition is
          // `zat_b29_actor_do_not_has_adv_task_af`.
          if ($isNotNil(artefact) && actorHasItem(artefact)) {
            report("actor already carries '%s', the trade phrase will stay closed", artefact);
          }

          // What `sr_idle@search_af` sets when a rival squad probes an anomaly holding the find.
          setInfoPortion(rival.foundPortion, true);
          setInfoPortion(infoPortions.zat_b29_stalkers_rivals_found_af, true);
          setInfoPortion(infoPortions.zat_b29_rivals_search, true);

          // `sr_idle@spawn_af` refuses to hand them the artefact while this is set from an earlier round.
          setInfoPortion(infoPortions.zat_b29_quest_af_given, false);
        },
        verify: (context: CheckContext): void => {
          // Every gate `zat_b29_stalker_rival_exchange_actor_dialog` declares.
          context.expect(
            getDialogs().zat_b29_actor_do_not_has_adv_task_af(registry.actor, registry.actor) === true,
            "trade dialog precondition",
            "actor carries the requested artefact, so 'zat_b29_actor_do_not_has_adv_task_af' is false"
          );
          context.expect(
            hasInfoPortion(infoPortions.zat_b29_stalkers_rivals_found_af),
            "rivals hold the find",
            "expected 'zat_b29_stalkers_rivals_found_af' to be set"
          );
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival),
            "trade still possible",
            "a rival already delivered to Beard, so the trade phrase is closed"
          );
        },
        handOff:
          "stay near them until the timer restrictor puts the artefact in the leader's pocket, then " +
          "trade for it - or run again and the exchange replica is applied for you",
        advanceWhen: (): boolean => hasInfoPortion(infoPortions.zat_b29_quest_af_given),
      },
      {
        name: "traded a rifle for their find",
        arrange: (context: CheckContext): void => {
          const artefact: Nillable<TSection> = resolveRequestedArtefact();

          if ($isNotNil(artefact) && actorHasItem(artefact)) {
            return report("actor already carries '%s', nothing to mirror", artefact);
          }

          const rival: Nillable<IRivalDescriptor> = resolveTradingRival();
          const leader: Nillable<GameObject> = $isNotNil(rival) ? getObjectByStoryId(rival.leaderStoryId) : null;

          if ($isNil(leader)) {
            return context.fail("mirror the trade", "the rival leader is not online, cannot exchange anything");
          }

          const hasGun: boolean = getDialogs().zat_b29_actor_has_exchange_item() === true;

          context.expect(
            hasGun,
            "something to trade",
            "actor carries none of the rifles the rivals accept, so the trade phrase would not be offered"
          );

          if (!hasGun) {
            return;
          }

          context.expectNoThrow(
            () => getDialogs().zat_b29_actor_exchange(registry.actor, leader),
            "mirror the trade",
            "dialogs_zaton.zat_b29_actor_exchange()"
          );

          // The `disable_info` set carried by the trade phrase.
          setInfoPortion(infoPortions.zat_b29_rivals_search, false);
          setInfoPortion(infoPortions.zat_b29_stalker_rival_1_found_af, false);
          setInfoPortion(infoPortions.zat_b29_stalker_rival_2_found_af, false);
          setInfoPortion(infoPortions.zat_b29_stalkers_rivals_found_af, false);
        },
        verify: (context: CheckContext): void => {
          const artefact: Nillable<TSection> = resolveRequestedArtefact();

          if ($isNil(artefact)) {
            return context.fail("trade settled", "nothing has been diced, so there is no find to have traded for");
          }

          context.expect(
            actorHasItem(artefact),
            "artefact traded over",
            `'${artefact}' is not in the inventory, so the exchange transferred nothing`
          );
        },
        handOff: "run again to see the other party reach Beard before you do",
      },
      {
        name: "the other party reached Beard first",
        arrange: (context: CheckContext): void => {
          teleportToBeard(context);

          setInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival, true);
        },
        verify: (context: CheckContext): void => {
          context.expect(
            getDialogs().zat_b29_actor_has_adv_task_af(registry.actor, registry.actor) === true,
            "hand in branch open",
            "'zat_b29_actor_has_adv_task_af' is false, so the hand in phrase would not be offered"
          );

          context.expect(
            hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival),
            "undercut branch armed",
            "expected 'zat_b29_linker_take_af_from_rival' to be set"
          );
        },
        handOff: "hand the artefact to Beard, or run again and the replica is applied for you",
      },
      {
        name: "hand in pays the undercut price",
        arrange: (context: CheckContext): void => {
          moneyBeforeHandIn = mirrorHandIn(context);
        },
        verify: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();

          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "task gate cleared",
            "expected the action to disable 'zat_b29_adv_task_given'"
          );

          if ($isNotNil(moneyBeforeHandIn) && $isNotNil(index)) {
            context.expectEqual(
              registry.actor.money() - moneyBeforeHandIn,
              resolveReward(index, true),
              "undercut price paid"
            );
          }

          context.expectEqual(evaluateTaskState(TASK_ID), ETaskState.COMPLETED, "state after the hand in");
        },
        handOff: "run again to confirm the completion effects",
        advanceWhen: (): boolean => !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
      },
      {
        name: "completion effects applied by the manager",
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
