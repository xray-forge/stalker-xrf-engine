import { GameObject, ServerObject } from "xray16/alias";
import { AnyCallablesModule, getExtern, LuaArray, Nillable, TCount, TIndex, TLabel, TName, TSection } from "xray16/lib";
import { $fromArray, $isNil, $isNotNil } from "xray16/macros";

import { CheckContext, report } from "@/engine/checks/framework/core";
import { evaluateTaskState, giveFreshTask, setInfoPortion } from "@/engine/checks/framework/world";
import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { getObjectByStoryId, getServerObjectByStoryId, isStoryObjectExisting, registry } from "@/engine/core/database";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasItem } from "@/engine/core/utils/item";
import { teleportActorToPatrol } from "@/engine/core/utils/position";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import {
  zatB29AfTable,
  zatB29InfopBringTable,
  zatB29InfopTable,
} from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/**
 * Shared ground for the zat_b29 flows.
 *
 * Each ending of the artefact hunt is walked by its own flow, and every one of them has to build the
 * same world state before it can reach its branch. That setup lives here so the flows stay isolated:
 * any of them can be started on any save, in any order, without another flow having run first.
 */

/** Task the chain issues. */
export const TASK_ID: TName = "zat_b29_adv_task";
/** Index range every b29 lookup table is keyed on. */
export const FIRST_INDEX: TIndex = 16;
export const LAST_INDEX: TIndex = 23;
/** Where `zat_b29_scene` places the actor at the Skadovsk base, so it is known to be walkable. */
export const BASE_WALK_PATH: TName = "zat_b29_actor_base_walk";
export const BASE_LOOK_PATH: TName = "zat_b29_actor_base_look";
/** Beard, who offers the hunt, takes the artefact and pays for it. */
export const BEARD_STORY_ID: TName = "zat_a2_stalker_barmen";
/** Restrictor driving the chain, from the start gate through the dice to the redice. */
export const CONTROL_ZONE: TName = "zat_b29_sr_control";

/**
 * Artefact the setup falls back to when nothing has been diced yet.
 */
export const FALLBACK_INDEX: TIndex = FIRST_INDEX;

/**
 * One of the two rival parties, in whichever exclusivity variant the chain put on the map.
 */
export interface IRivalDescriptor {
  squadStoryId: TName;
  leaderStoryId: TName;
  foundPortion: TInfoPortion;
  takenOutPortion: TInfoPortion;
}

/**
 * Both rival parties in both variants. `zat_b29_sr_rival_1` and `_2` pick between them on
 * `zat_b29_exclusive_conditions`, so everything here looks for both and uses whichever exists.
 */
export const RIVALS: LuaArray<IRivalDescriptor> = $fromArray<IRivalDescriptor>([
  {
    squadStoryId: "zat_b29_stalker_rival_1_squad",
    leaderStoryId: "zat_b29_stalker_rival_1",
    foundPortion: infoPortions.zat_b29_stalker_rival_1_found_af,
    takenOutPortion: infoPortions.zat_b29_first_rival_taken_out,
  },
  {
    squadStoryId: "zat_b29_stalker_rival_2_squad",
    leaderStoryId: "zat_b29_stalker_rival_2",
    foundPortion: infoPortions.zat_b29_stalker_rival_2_found_af,
    takenOutPortion: infoPortions.zat_b29_second_rival_taken_out,
  },
  {
    squadStoryId: "zat_b29_stalker_rival_default_1_squad",
    leaderStoryId: "zat_b29_stalker_rival_default_1",
    foundPortion: infoPortions.zat_b29_stalker_rival_1_found_af,
    takenOutPortion: infoPortions.zat_b29_first_rival_taken_out,
  },
  {
    squadStoryId: "zat_b29_stalker_rival_default_2_squad",
    leaderStoryId: "zat_b29_stalker_rival_default_2",
    foundPortion: infoPortions.zat_b29_stalker_rival_2_found_af,
    takenOutPortion: infoPortions.zat_b29_second_rival_taken_out,
  },
]);

/**
 * @returns The `dialogs_zaton` extern namespace, where the chain keeps its dialog logic.
 */
export function getDialogs(): AnyCallablesModule {
  return getExtern<AnyCallablesModule>("dialogs_zaton");
}

/**
 * @returns Index of the artefact the chain is asking for, or null while nothing has been diced.
 */
export function resolveRequestedIndex(): Nillable<TIndex> {
  for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
    if (hasInfoPortion(zatB29InfopTable.get(index))) {
      return index;
    }
  }

  return null;
}

/**
 * @returns How many requested-artefact portions are set. More than one means the dice left the chain
 *   asking for several artefacts at once.
 */
export function countRequestedIndices(): TCount {
  let count: TCount = 0;

  for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
    if (hasInfoPortion(zatB29InfopTable.get(index))) {
      count += 1;
    }
  }

  return count;
}

/**
 * @returns Section of the requested artefact, or null while nothing has been diced.
 */
export function resolveRequestedArtefact(): Nillable<TSection> {
  const index: Nillable<TIndex> = resolveRequestedIndex();

  return $isNotNil(index) ? zatB29AfTable.get(index) : null;
}

/**
 * Mirror the payout table of `dialogs_zaton.zat_b29_linker_get_adv_task_af`.
 *
 * @param index - Index of the requested artefact.
 * @param isUndercut - Whether a rival already delivered one, which lowers the price a tier.
 * @returns Money the hand in is expected to pay.
 */
export function resolveReward(index: TIndex, isUndercut: boolean): TCount {
  if (index < 20) {
    return isUndercut ? 12_000 : 18_000;
  }

  return isUndercut ? 18_000 : 24_000;
}

/**
 * Put the chain back in the state it starts from, without touching what the actor is carrying.
 *
 * Every flow calls this from its `reset`, so resetting one leaves the others startable rather than
 * halfway into somebody else's branch.
 */
export function clearChain(): void {
  for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
    setInfoPortion(zatB29InfopTable.get(index) as TInfoPortion, false);
    setInfoPortion(zatB29InfopBringTable.get(index) as TInfoPortion, false);
  }

  setInfoPortion(infoPortions.zat_b29_task_start, false);
  setInfoPortion(infoPortions.zat_b29_task_fail, false);
  setInfoPortion(infoPortions.zat_b29_linker_info, false);
  setInfoPortion(infoPortions.zat_b29_barmen_dialog_disable, false);
  setInfoPortion(infoPortions.zat_b29_adv_task_given, false);
  setInfoPortion(infoPortions.zat_b29_adv_task_timeout, false);
  setInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival, false);
  setInfoPortion(infoPortions.zat_b29_redice, false);
  setInfoPortion(infoPortions.zat_b29_rivals_search, false);
  setInfoPortion(infoPortions.zat_b29_stalker_rival_1_found_af, false);
  setInfoPortion(infoPortions.zat_b29_stalker_rival_2_found_af, false);
  setInfoPortion(infoPortions.zat_b29_stalkers_rivals_found_af, false);
  setInfoPortion(infoPortions.zat_b29_quest_af_given, false);
  setInfoPortion(infoPortions.zat_b29_rival_sound_played, false);
  setInfoPortion(infoPortions.zat_b29_first_rival_taken_out, false);
  setInfoPortion(infoPortions.zat_b29_second_rival_taken_out, false);
  setInfoPortion(infoPortions.zat_b29_linker_fears_actor, false);
  setInfoPortion(infoPortions.zat_b29_respawn, false);

  report("cleared the b29 chain, the control restrictor is back at its start gate");
}

/**
 * Unlock the hunt, so the offer dialog is reachable and the dice is allowed to run.
 */
export function ensureHuntOpen(): void {
  setInfoPortion(infoPortions.zat_a2_stalker_barmen_setup, true);

  // Any of these parks the chain in `sr_idle@nil`, reverses it, or hides the offer behind a refusal.
  setInfoPortion(infoPortions.zat_b29_task_fail, false);
  setInfoPortion(infoPortions.zat_b29_linker_fears_actor, false);
  setInfoPortion(infoPortions.zat_b30_barmen_under_sultan, false);
  setInfoPortion(infoPortions.zat_b29_adv_task_timeout, false);

  // b14's own `on_complete`, and the only gate `sr_idle@wait_for_start` waits on.
  setInfoPortion(infoPortions.zat_b14_smart_terrain_open, true);
  setInfoPortion(infoPortions.zat_b29_task_start, true);

  // What `zat_a2_linker_b29_actor_info` gives, and the only gate on the offer dialog.
  setInfoPortion(infoPortions.zat_b29_linker_info, true);
  setInfoPortion(infoPortions.zat_b29_barmen_dialog_disable, true);
}

/**
 * Make sure the chain is asking for exactly one artefact, and say which.
 *
 * @returns Index of the requested artefact.
 */
export function ensureArtefactRequested(): TIndex {
  const diced: Nillable<TIndex> = countRequestedIndices() === 1 ? resolveRequestedIndex() : null;

  if ($isNotNil(diced)) {
    report("chain is already asking for '%s' (index %s)", zatB29AfTable.get(diced), diced);

    return diced;
  }

  for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
    setInfoPortion(zatB29InfopTable.get(index) as TInfoPortion, index === FALLBACK_INDEX);
  }

  report("pinned the request to '%s' (index %s)", zatB29AfTable.get(FALLBACK_INDEX), FALLBACK_INDEX);

  return FALLBACK_INDEX;
}

/**
 * Apply what accepting the offer does: the `script_text` of phrase 1, then the `give_info` pair the
 * accepting phrase carries.
 *
 * Order matters. `zat_b29_linker_give_adv_task` clears every bring portion on its way to building the
 * artefact list, so the accepted one has to be set after it.
 *
 * @param context - Running flow context.
 * @param index - Index of the artefact being accepted.
 */
export function acceptOffer(context: CheckContext, index: TIndex): void {
  const beard: Nillable<GameObject> = getObjectByStoryId(BEARD_STORY_ID);

  if ($isNotNil(beard)) {
    context.expectNoThrow(
      () => report("Beard asks for: %s", tostring(getDialogs().zat_b29_linker_give_adv_task(registry.actor, beard))),
      "build the offer text",
      "dialogs_zaton.zat_b29_linker_give_adv_task()"
    );
  } else {
    report("'%s' is not online, skipping the offer text", BEARD_STORY_ID);
  }

  setInfoPortion(zatB29InfopBringTable.get(index) as TInfoPortion, true);
  setInfoPortion(infoPortions.zat_b29_adv_task_given, true);

  report("accepted the hunt for '%s' (index %s)", zatB29AfTable.get(index), index);
}

/**
 * Put the requested artefact in the actor's hands, unless it is already carried.
 *
 * @param index - Index of the requested artefact.
 */
export function supplyArtefact(index: TIndex): void {
  const section: TSection = zatB29AfTable.get(index);

  if (actorHasItem(section)) {
    return report("actor already carries '%s'", section);
  }

  report("actor has no '%s', spawning one into the inventory", section);
  spawnItemsForObject(registry.actor, section, 1);
}

/**
 * Ask the quest's own dialog function to place the requested artefact, then let the zone act on it.
 *
 * @param context - Running flow context.
 */
export function requestArtefactSpawn(context: CheckContext): void {
  const isRequested: boolean = context.expectNoThrow(
    () => getDialogs().zat_b29_create_af_in_anomaly(),
    "request artefact spawn",
    "dialogs_zaton.zat_b29_create_af_in_anomaly()"
  );

  if (!isRequested) {
    return;
  }

  for (const [zoneName, zone] of registry.anomalyZones) {
    if (zone.hasForcedSpawnOverride) {
      // Narrower than `respawnArtefactsAndChangeLayers`, which also rerolls the anomaly layer.
      zone.shouldRespawnArtefactsIfPossible = true;
      report("queued artefact '%s' in '%s'", tostring(zone.forcedArtefact), zoneName);
    }
  }
}

/**
 * Find the anomaly zones reporting that they hold the artefact the chain asks for.
 *
 * @returns Binders of the zones claiming the requested artefact.
 */
export function findClaimingZones(): LuaArray<AnomalyZoneBinder> {
  const conditions: AnyCallablesModule = getExtern<AnyCallablesModule>("xr_conditions");
  const claiming: LuaArray<AnomalyZoneBinder> = new LuaTable();

  for (const [zoneName, zone] of registry.anomalyZones) {
    if (conditions.zat_b29_anomaly_has_af(null, null, [zoneName]) === true) {
      table.insert(claiming, zone);
    }
  }

  return claiming;
}

/**
 * @returns Rival parties currently in the world, in either exclusivity variant.
 */
export function findRivals(): LuaArray<IRivalDescriptor> {
  const found: LuaArray<IRivalDescriptor> = new LuaTable();

  for (const [, rival] of RIVALS) {
    if (isStoryObjectExisting(rival.squadStoryId)) {
      table.insert(found, rival);
    }
  }

  return found;
}

/**
 * @param rival - Rival party to locate.
 * @returns Server object of the rival squad, which exists whether or not the squad is online.
 */
export function getRivalSquad(rival: IRivalDescriptor): Nillable<ServerObject> {
  return getServerObjectByStoryId(rival.squadStoryId);
}

/**
 * Put the actor at Beard, on a spot the scene already treats as walkable.
 *
 * @param context - Running flow context.
 */
export function teleportToBeard(context: CheckContext): void {
  context.expectNoThrow(
    () => teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH),
    "teleport to Beard",
    `teleportActorToPatrol('${BASE_WALK_PATH}', '${BASE_LOOK_PATH}')`
  );
}

/**
 * Mirror selecting the hand in phrase: run its action, then apply its `give_info`.
 *
 * @param context - Running flow context.
 * @returns Actor money recorded immediately before the action, or null when nothing was mirrored.
 */
export function mirrorHandIn(context: CheckContext): Nillable<TCount> {
  const artefact: Nillable<TSection> = resolveRequestedArtefact();

  if ($isNil(artefact) || !actorHasItem(artefact)) {
    report("artefact already handed over in play, nothing to mirror");

    return null;
  }

  const beard: Nillable<GameObject> = getObjectByStoryId(BEARD_STORY_ID);

  if ($isNil(beard)) {
    context.fail("mirror the replica", `'${BEARD_STORY_ID}' is not online, cannot transfer the artefact`);

    return null;
  }

  const before: TCount = registry.actor.money();

  context.expectNoThrow(
    () => getDialogs().zat_b29_linker_get_adv_task_af(registry.actor, beard),
    "mirror the replica",
    "dialogs_zaton.zat_b29_linker_get_adv_task_af()"
  );
  setInfoPortion(infoPortions.zat_b29_redice, true);

  return before;
}

/**
 * Assert the task title resolved to something.
 *
 * @param context - Running flow context.
 * @param when - What portion state the title is being checked under.
 */
export function expectTitleResolves(context: CheckContext, when: TLabel): void {
  evaluateTaskState(TASK_ID);

  const task: Nillable<TaskObject> = taskConfig.ACTIVE_TASKS.get(TASK_ID);

  if ($isNil(task)) {
    return context.fail(`title resolves ${when}`, "task is not active");
  }

  context.expect(
    $isNotNil(task.currentTitle) && task.currentTitle !== "",
    `title resolves ${when}`,
    `title condlist yielded '${tostring(task.currentTitle)}'`
  );
}

/**
 * Make sure the task is in the log, letting the chain's own restrictor do it when it already has.
 */
export function ensureTaskGiven(): void {
  if ($isNotNil(taskConfig.ACTIVE_TASKS.get(TASK_ID))) {
    return report("task is already in the log");
  }

  report("task is not in the log yet, giving it rather than waiting for '%s'", CONTROL_ZONE);
  giveFreshTask(TASK_ID);
}
