import { GameObject } from "xray16/alias";
import {
  AnyCallablesModule,
  getExtern,
  LuaArray,
  Nillable,
  TCount,
  TIndex,
  TName,
  TSection,
  TStringId,
} from "xray16/lib";
import { $dirname, $filename, $isNil, $isNotNil } from "xray16/macros";

import { CheckContext, ICheckResult, report } from "@/engine/checks/framework/core";
import { resetFlow, runFlow } from "@/engine/checks/framework/flow";
import { forceTaskEvaluation, giveFreshTask, setInfoPortion } from "@/engine/checks/framework/world";
import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { getManager, getObjectByStoryId, registry } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { teleportActorNearPosition, teleportActorToPatrol } from "@/engine/core/utils/position";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/** Task the flow walks. */
const TASK_ID: TStringId = "zat_b29_adv_task";
/** Index range the b29 lookup tables are keyed on. */
const FIRST_INDEX: TIndex = 16;
const LAST_INDEX: TIndex = 23;
/** Artefact variant the flow pins the quest to, so the title and description functors resolve. */
const PINNED_INDEX: TIndex = FIRST_INDEX;
/** Where `zat_b29_scene` places the actor at the Skadovsk base, so it is known to be walkable. */
const BASE_WALK_PATH: TName = "zat_b29_actor_base_walk";
const BASE_LOOK_PATH: TName = "zat_b29_actor_base_look";
/** Artefact the pinned variant asks for. */
const WANTED_ARTEFACT: TSection = zatB29AfTable.get(PINNED_INDEX);
/** Beard, who takes the artefact and pays for it. */
const BEARD_STORY_ID: TStringId = "zat_a2_stalker_barmen";

/**
 * Actor money recorded just before the hand in, so the reward can be checked as a delta.
 * Null while no hand in has been mirrored in this invocation.
 */
let moneyBeforeHandIn: Nillable<TCount> = null;

/**
 * Ask the quest's own dialog function to place the wanted artefact, then let the zone act on it.
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
 * Every anomaly zone on the level is present: they are space restrictors, which the engine never
 * switches offline, so this does not depend on where the actor is standing.
 *
 * @returns Binders of the zones claiming the wanted artefact.
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
 * @returns Whether the actor is carrying the artefact this run pinned the quest to.
 */
function isWantedArtefactCarried(): boolean {
  return $isNotNil(registry.actor.object(WANTED_ARTEFACT));
}

/**
 * Evaluate the task from the current portion state.
 *
 * @returns Settled task state, or null when no gate matched.
 */
function evaluateState(): Nillable<ETaskState> {
  forceTaskEvaluation(TASK_ID);
  getManager(TaskManager).isTaskCompleted(TASK_ID);

  return taskConfig.ACTIVE_TASKS.get(TASK_ID)?.state;
}

/**
 * Zaton b29 advanced task, walked one step per invocation with real play in between.
 */
export function run(): ICheckResult {
  return runFlow($dirname, $filename, {
    requires: { level: "zaton" },
    steps: [
      {
        name: "task given and held open",
        arrange: (context: CheckContext): void => {
          context.expectNoThrow(
            () => teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH),
            "teleport to the base",
            `teleportActorToPatrol('${BASE_WALK_PATH}', '${BASE_LOOK_PATH}')`
          );

          // Pin the quest to a single artefact variant.
          for (const index of $range(FIRST_INDEX, LAST_INDEX)) {
            setInfoPortion(zatB29InfopBringTable.get(index) as TInfoPortion, index === PINNED_INDEX);
          }

          setInfoPortion(infoPortions.zat_b29_adv_task_timeout, false);
          setInfoPortion(infoPortions.zat_b29_adv_task_given, true);

          giveFreshTask(TASK_ID);

          // Same as a real run: the artefact is placed when the task is handed out, not later.
          requestArtefactSpawn(context);
        },
        verify: (context: CheckContext): void => {
          context.expectEqual(evaluateState(), null, "held open while the task is given");
        },
        handOff:
          "nothing to do here: anomaly zones never go offline, so the queued artefact spawns on the " +
          "zone's next update wherever you are. Run again once it has",
        advanceWhen: (): boolean => findClaimingZones().length() > 0,
      },
      {
        name: "exactly one anomaly zone claims the artefact",
        arrange: (context: CheckContext): void => {
          const claiming: LuaArray<AnomalyZoneBinder> = findClaimingZones();
          const zone: Nillable<AnomalyZoneBinder> = claiming.get(1);

          if ($isNil(zone)) {
            return report("no zone claims the artefact, staying put");
          }

          report("moving to '%s', which holds the artefact", zone.object.name());

          // Restrictors occupy no AI location of their own, so arrive at the nearest spot the actor
          // can actually stand rather than at the zone's own vertex.
          context.expectNoThrow(
            () => teleportActorNearPosition(zone.object.position()),
            "teleport to the anomaly",
            `teleportActorNearPosition('${zone.object.name()}')`
          );

          if (isWantedArtefactCarried()) {
            report("actor already carries '%s'", WANTED_ARTEFACT);
          } else {
            report("actor has no '%s', spawning one into the inventory", WANTED_ARTEFACT);
            spawnItemsForObject(registry.actor, WANTED_ARTEFACT, 1);
          }
        },
        verify: (context: CheckContext): void => {
          // 0 means the artefact never spawned, more than 1 means the lookup is not scoped per zone.
          context.expectEqual(findClaimingZones().length(), 1, "zones claiming the artefact");
        },
        handOff:
          `collect '${WANTED_ARTEFACT}' from the anomaly if you want to, otherwise one has been put ` +
          `in the inventory for the hand in`,
      },
      {
        name: "hand in opens once the artefact is carried",
        arrange: (context: CheckContext): void => {
          context.expectNoThrow(
            () => teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH),
            "teleport to the base",
            `teleportActorToPatrol('${BASE_WALK_PATH}', '${BASE_LOOK_PATH}')`
          );

          // Pins the reward branch: phrase 2 of the dialog, worth less than the untouched artefact.
          setInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival, true);
        },
        verify: (context: CheckContext): void => {
          const dialogs: AnyCallablesModule = getExtern<AnyCallablesModule>("dialogs_zaton");

          context.expect(isWantedArtefactCarried(), "artefact carried", `actor is not carrying '${WANTED_ARTEFACT}'`);

          // Both gates the dialog itself declares: its precondition and its `has_info`.
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
        },
        handOff: "hand the artefact to Beard, or run again and the replica is applied for you",
      },
      {
        name: "give artefact replica clears the task and pays out",
        arrange: (context: CheckContext): void => {
          if (!isWantedArtefactCarried()) {
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
          // The action clears this itself, which is what opens `condlist_0` and completes the task.
          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_adv_task_given),
            "task gate cleared",
            "expected the action to disable 'zat_b29_adv_task_given'"
          );

          if ($isNotNil(moneyBeforeHandIn)) {
            context.expectEqual(registry.actor.money() - moneyBeforeHandIn, 12_000, "reward paid");
          }

          context.expectEqual(evaluateState(), ETaskState.COMPLETED, "state after the hand in");

          const task: Nillable<TaskObject> = taskConfig.ACTIVE_TASKS.get(TASK_ID);

          if ($isNil(task) || $isNil(task.task)) {
            return context.fail("on_complete applied", "task object or its game task was missing");
          }

          // `on_complete` runs on deactivation rather than on evaluation, so drive it explicitly.
          task.onDeactivate(task.task);

          context.expect(
            !hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival),
            "on_complete applied",
            "expected 'zat_b29_linker_take_af_from_rival' to be cleared by on_complete"
          );
        },
        handOff: "hand in done, run once more to confirm the artefact left the inventory",
        advanceWhen: (): boolean => !isWantedArtefactCarried(),
      },
    ],
  });
}

/**
 * Send the flow back to its first step.
 */
export function reset(): void {
  resetFlow($dirname, $filename);
}
