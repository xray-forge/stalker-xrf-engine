import { GameObject } from "xray16/alias";
import {
  AnyCallablesModule,
  getExtern,
  LuaArray,
  Nillable,
  TCount,
  TIndex,
  TLabel,
  TName,
  TSection,
  TStringId,
} from "xray16/lib";
import { $dirname, $filename, $fromArray, $isNil, $isNotNil } from "xray16/macros";

import { CheckContext, ICheckResult, report } from "@/engine/checks/framework/core";
import { resetFlow, runFlow } from "@/engine/checks/framework/flow";
import { evaluateTaskState, setInfoPortion } from "@/engine/checks/framework/world";
import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { getObjectByStoryId, isStoryObjectExisting, registry } from "@/engine/core/database";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasItem } from "@/engine/core/utils/item";
import { teleportActorNearPosition, teleportActorToPatrol } from "@/engine/core/utils/position";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import {
  zatB29AfTable,
  zatB29InfopBringTable,
  zatB29InfopTable,
} from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/** Task the flow walks. */
const TASK_ID: TStringId = "zat_b29_adv_task";
/** Index range the b29 lookup tables are keyed on. */
const FIRST_INDEX: TIndex = 16;
const LAST_INDEX: TIndex = 23;
/** Where `zat_b29_scene` places the actor at the Skadovsk base, so it is known to be walkable. */
const BASE_WALK_PATH: TName = "zat_b29_actor_base_walk";
const BASE_LOOK_PATH: TName = "zat_b29_actor_base_look";
/** Beard, who gives the hunt, takes the artefact and pays for it. */
const BEARD_STORY_ID: TStringId = "zat_a2_stalker_barmen";
/** Restrictor driving the whole chain, from the start gate to the redice. */
const CONTROL_ZONE: TName = "zat_b29_sr_control";
/** Rival squads `zat_b29_sr_rival_1` and `_2` create once the task is out, by exclusivity variant. */
const RIVAL_SQUADS: LuaArray<TStringId> = $fromArray<TStringId>([
  "zat_b29_stalker_rival_1_squad",
  "zat_b29_stalker_rival_2_squad",
]);
const DEFAULT_RIVAL_SQUADS: LuaArray<TStringId> = $fromArray<TStringId>([
  "zat_b29_stalker_rival_default_1_squad",
  "zat_b29_stalker_rival_default_2_squad",
]);

/**
 * Actor money recorded just before the hand in, so the reward can be checked as a delta.
 * Null while no hand in has been mirrored in this invocation.
 */
let moneyBeforeHandIn: Nillable<TCount> = null;

/**
 * Read which artefact the chain is currently asking for.
 *
 * @returns Index of the requested artefact, or null while nothing has been diced.
 */
function resolveRequestedIndex(): Nillable<TIndex> {
  for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
    if (hasInfoPortion(zatB29InfopTable.get(index))) {
      return index;
    }
  }

  return null;
}

/**
 * @returns How many of the eight requested-artefact portions are set. More than one means the dice
 *   left the chain asking for several artefacts at once.
 */
function countRequestedIndices(): TCount {
  let count: TCount = 0;

  for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
    if (hasInfoPortion(zatB29InfopTable.get(index))) {
      count += 1;
    }
  }

  return count;
}

/**
 * Mirror the payout table of `dialogs_zaton.zat_b29_linker_get_adv_task_af`.
 *
 * @param index - Index of the requested artefact.
 * @param isRivalDelivered - Whether a rival already brought Beard one, which halves the premium.
 * @returns Money the hand in is expected to pay.
 */
function resolveExpectedReward(index: TIndex, isRivalDelivered: boolean): TCount {
  if (index < 20) {
    return isRivalDelivered ? 12_000 : 18_000;
  }

  return isRivalDelivered ? 18_000 : 24_000;
}

/**
 * Ask the quest's own dialog function to place the requested artefact, then let the zone act on it.
 *
 * @param context - Running flow context.
 */
function requestArtefactSpawn(context: CheckContext): void {
  const dialogs: AnyCallablesModule = getExtern<AnyCallablesModule>("dialogs_zaton");
  const isRequested: boolean = context.expectNoThrow(
    () => dialogs.zat_b29_create_af_in_anomaly(),
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
 * Find the anomaly zones reporting that they hold the artefact the quest asks for.
 *
 * Every anomaly zone on the level is present: they are space restrictors, which the engine keeps
 * online for as long as the level is loaded, so this does not depend on where the actor is standing.
 *
 * @returns Binders of the zones claiming the requested artefact.
 */
function findClaimingZones(): LuaArray<AnomalyZoneBinder> {
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
 * Report which rival squads the chain put on the map.
 *
 * `zat_b29_sr_rival_1` and `_2` pick between the named and the default squads on
 * `zat_b29_exclusive_conditions`, so both variants are looked for and whichever exists is reported.
 *
 * @returns Story ids of the rival squads currently in the world.
 */
function findRivalSquads(): LuaArray<TStringId> {
  const found: LuaArray<TStringId> = new LuaTable();

  for (const list of [RIVAL_SQUADS, DEFAULT_RIVAL_SQUADS]) {
    for (const [, storyId] of list) {
      if (isStoryObjectExisting(storyId)) {
        table.insert(found, storyId);
      }
    }
  }

  return found;
}

/**
 * Assert the task title resolved to something.
 *
 * @param context - Running flow context.
 * @param when - What portion state the title is being checked under.
 */
function expectTitleResolves(context: CheckContext, when: TLabel): void {
  // Recomputes the title from the condlist without re-giving the task: a second `giveTask` would hand
  // the engine another game task for the same id, firing the completion notification once per copy.
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
 * Zaton b29 artefact hunt, walked end to end: the b14 gate opens it, Beard explains it, the dice picks
 * an artefact, the task is handed out by its own restrictor, rivals are sent after the same find, the
 * artefact is placed in an anomaly, and the hand in pays the undercut-free price and re-arms the hunt.
 *
 * The rival branch - meeting them, trading for their find, or letting one reach Beard first - changes
 * the payout and is walked by `zat_b29_rivals.flow`.
 */
export function run(): ICheckResult {
  return runFlow($dirname, $filename, {
    requires: { level: "zaton" },
    steps: [
      {
        name: "hunt unlocked at Beard",
        arrange: (context: CheckContext): void => {
          context.expectNoThrow(
            () => teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH),
            "teleport to Beard",
            `teleportActorToPatrol('${BASE_WALK_PATH}', '${BASE_LOOK_PATH}')`
          );

          setInfoPortion(infoPortions.zat_a2_stalker_barmen_setup, true);

          // Any of these three parks the chain in `sr_idle@nil` or hides the offer behind a refusal.
          setInfoPortion(infoPortions.zat_b29_task_fail, false);
          setInfoPortion(infoPortions.zat_b29_linker_fears_actor, false);
          setInfoPortion(infoPortions.zat_b30_barmen_under_sultan, false);

          // The gate `sr_idle@wait_for_start` waits on. It is b14's own `on_complete`, so finishing
          // that chain is what opens this one - designed progression, not a shortcut.
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
            hasInfoPortion(infoPortions.zat_b29_task_start),
            "hunt open",
            "'zat_b29_task_start' is absent, so the offer dialog is not reachable"
          );
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

          const beard: Nillable<GameObject> = getObjectByStoryId(BEARD_STORY_ID);

          if ($isNil(beard)) {
            return context.fail("accept the offer", `'${BEARD_STORY_ID}' is not online, cannot open the dialog`);
          }

          const dialogs: AnyCallablesModule = getExtern<AnyCallablesModule>("dialogs_zaton");

          // Phrase 1 of the offer is `script_text`, so it runs before any answer is picked. It also
          // clears every bring portion, which is why the accepted one is applied after it.
          context.expectNoThrow(
            () => report("Beard asks for: %s", tostring(dialogs.zat_b29_linker_give_adv_task(registry.actor, beard))),
            "build the offer text",
            "dialogs_zaton.zat_b29_linker_give_adv_task()"
          );

          // The `give_info` pair carried by the accepting phrase, one per artefact.
          setInfoPortion(zatB29InfopBringTable.get(index) as TInfoPortion, true);
          setInfoPortion(infoPortions.zat_b29_adv_task_given, true);

          report("accepted the hunt for '%s' (index %s)", zatB29AfTable.get(index), index);
        },
        verify: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();

          context.expect(
            hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "offer accepted",
            "expected the accepting phrase to set 'zat_b29_adv_task_given'"
          );

          if ($isNotNil(index)) {
            context.expect(
              hasInfoPortion(zatB29InfopBringTable.get(index)),
              "bring portion set",
              `'${zatB29InfopBringTable.get(index)}' is absent, so the hand in phrases stay closed`
            );
          }
        },
        // Deliberately not calling `giveTask` here: `sr_idle@give_task` does it on its next update, and
        // whether that fires is the thing worth checking.
        handOff: "run again once the control restrictor has handed the task over",
        advanceWhen: (): boolean => $isNotNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
      },
      {
        name: "task in the log, rivals sent after the same find",
        verify: (context: CheckContext): void => {
          context.expectEqual(evaluateTaskState(TASK_ID), null, "held open while the artefact is out there");
          expectTitleResolves(context, "with the artefact still missing");

          const rivals: LuaArray<TStringId> = findRivalSquads();

          for (const [, storyId] of rivals) {
            report("rival squad on the map: %s", storyId);
          }

          context.expectEqual(rivals.length(), 2, "rival squads created");
        },
        handOff: "run again to place the artefact in an anomaly",
      },
      {
        name: "artefact placed in an anomaly",
        arrange: (context: CheckContext): void => {
          // Same as a real run: the artefact is placed when the task is handed out, not when it is found.
          requestArtefactSpawn(context);
        },
        verify: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();
          let overrides: TCount = 0;

          for (const [, zone] of registry.anomalyZones) {
            if (zone.hasForcedSpawnOverride) {
              overrides += 1;

              if ($isNotNil(index)) {
                context.expectEqual(zone.forcedArtefact, zatB29AfTable.get(index), "override matches the request");
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
          const wanted: Nillable<TSection> = $isNotNil(index) ? zatB29AfTable.get(index) : null;
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

          if ($isNil(wanted)) {
            return;
          }

          if (actorHasItem(wanted)) {
            report("actor already carries '%s'", wanted);
          } else {
            report("actor has no '%s', spawning one into the inventory", wanted);
            spawnItemsForObject(registry.actor, wanted, 1);
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
          context.expectNoThrow(
            () => teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH),
            "teleport to Beard",
            `teleportActorToPatrol('${BASE_WALK_PATH}', '${BASE_LOOK_PATH}')`
          );
        },
        verify: (context: CheckContext): void => {
          const index: Nillable<TIndex> = resolveRequestedIndex();
          const dialogs: AnyCallablesModule = getExtern<AnyCallablesModule>("dialogs_zaton");

          if ($isNotNil(index)) {
            context.expect(
              actorHasItem(zatB29AfTable.get(index)),
              "artefact carried",
              `actor is not carrying '${zatB29AfTable.get(index)}'`
            );
          }

          // Both gates the hand in dialog declares: its precondition and its `has_info`.
          context.expect(
            dialogs.zat_b29_actor_has_adv_task_af(registry.actor, registry.actor) === true,
            "hand in branch open",
            "'zat_b29_actor_has_adv_task_af' is false, so the hand in phrase would not be offered"
          );
          context.expect(
            hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "dialog reachable",
            "'zat_b29_adv_task_given' is absent, so 'zat_a2_linker_b29_actor_give_adv_task' would not open"
          );

          // Phrase 1 is the undercut-free branch. Phrase 2 replaces it once a rival has delivered, and
          // that is the case `zat_b29_rivals.flow` walks.
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
          const index: Nillable<TIndex> = resolveRequestedIndex();

          if ($isNil(index) || !actorHasItem(zatB29AfTable.get(index))) {
            return report("artefact already handed over in play, nothing to mirror");
          }

          const beard: Nillable<GameObject> = getObjectByStoryId(BEARD_STORY_ID);

          if ($isNil(beard)) {
            return context.fail(
              "mirror the replica",
              `'${BEARD_STORY_ID}' is not online, cannot transfer the artefact`
            );
          }

          const dialogs: AnyCallablesModule = getExtern<AnyCallablesModule>("dialogs_zaton");

          moneyBeforeHandIn = registry.actor.money();

          // Exactly what selecting the phrase does: run its action, then apply its `give_info`.
          context.expectNoThrow(
            () => dialogs.zat_b29_linker_get_adv_task_af(registry.actor, beard),
            "mirror the replica",
            "dialogs_zaton.zat_b29_linker_get_adv_task_af()"
          );
          setInfoPortion(infoPortions.zat_b29_redice, true);
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
              resolveExpectedReward(index, false),
              "reward paid"
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

          const index: Nillable<TIndex> = resolveRequestedIndex();

          if ($isNotNil(index)) {
            context.expect(
              !actorHasItem(zatB29AfTable.get(index)),
              "artefact taken",
              `'${zatB29AfTable.get(index)}' is still in the inventory`
            );
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
 * Send the flow back to its first step.
 */
export function reset(): void {
  for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
    setInfoPortion(zatB29InfopTable.get(index) as TInfoPortion, false);
    setInfoPortion(zatB29InfopBringTable.get(index) as TInfoPortion, false);
  }

  setInfoPortion(infoPortions.zat_b29_task_start, false);
  setInfoPortion(infoPortions.zat_b29_linker_info, false);
  setInfoPortion(infoPortions.zat_b29_barmen_dialog_disable, false);
  setInfoPortion(infoPortions.zat_b29_adv_task_given, false);
  setInfoPortion(infoPortions.zat_b29_adv_task_timeout, false);
  setInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival, false);
  setInfoPortion(infoPortions.zat_b29_redice, false);

  report("cleared the b29 portions this flow drives, which sends the control restrictor back to its start gate");

  resetFlow($dirname, $filename);
}
