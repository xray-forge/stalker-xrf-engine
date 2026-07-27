import { GameObject, ServerObject, Vector } from "xray16/alias";
import {
  ACTOR_ID,
  AnyCallablesModule,
  createVector,
  getExtern,
  Nillable,
  TCount,
  TLabel,
  TName,
  TSection,
  TStringId,
} from "xray16/lib";
import { $dirname, $filename, $isNil, $isNotNil } from "xray16/macros";

import { CheckContext, ICheckResult, report } from "@/engine/checks/framework/core";
import { resetFlow, runFlow } from "@/engine/checks/framework/flow";
import { evaluateTaskState, giveFreshTask, setInfoPortion } from "@/engine/checks/framework/world";
import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import {
  getObjectByStoryId,
  getPortableStoreValue,
  getServerObjectByStoryId,
  registry,
  setPortableStoreValue,
} from "@/engine/core/database";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasItem } from "@/engine/core/utils/item";
import { teleportActorToPatrol, teleportActorToPosition } from "@/engine/core/utils/position";

/** Task the flow walks. */
const TASK_ID: TStringId = "zat_b14_learn_about_strange_occurrence";
/** What `on_init` is expected to hand out the moment the task exists. */
const ON_INIT_PORTION: TInfoPortion = infoPortions.zat_b14_learn_about_strange_occurrence_give_task;
/** Item the hand in transfers, per `dialogs_zaton.zat_b14_transfer_artefact`. */
const QUEST_ARTEFACT: TSection = artefacts.af_quest_b14_twisted;
/** Story id of the artefact placed in the world for this chain. */
const ARTEFACT_STORY_ID: TStringId = "zat_b14_artefact_id";
/** Beard, who gives the chain and takes the item. */
const BEARD_STORY_ID: TStringId = "zat_a2_stalker_barmen";
/** Walkable actor spot at the Skadovsk base, borrowed from the b29 scene. */
const BASE_WALK_PATH: TName = "zat_b29_actor_base_walk";
const BASE_LOOK_PATH: TName = "zat_b29_actor_base_look";

const ROBBERY_ZONE: TName = "zat_b14_robbery_start";
const ARTEFACT_POSITION: Vector = createVector(412.489, -0.942, 231.008);
const ROBBERY_POSITION: Vector = createVector(410.694, -5.751, 219.537);
const TASK_REWARD: TCount = 3_000;

/**
 * The other task of this chain. Both share `condlist_0 = {+zat_b14_give_item_linker} complete` and
 * both carry their own `reward_money`, so one portion closes whichever of them are active and pays for
 * each. That is vanilla behaviour, not a defect, and the flow models it rather than being surprised.
 */
const SIBLING_TASK_ID: TStringId = "zat_b14_learn_about_strange_occurrence_by_stalkers";

/**
 * Actor store keys holding the reward baseline. The reward only lands on the invocation after the hand
 * in, and the module is reloaded between invocations, so a module variable would not survive.
 */
const MONEY_BEFORE_KEY: TName = "xrf_b14_money_before";
const TASKS_PENDING_KEY: TName = "xrf_b14_tasks_pending";

/**
 * Record what the reward should come to, just before the hand in closes the tasks.
 */
function rememberPendingReward(): void {
  let pending: TCount = 0;

  for (const taskId of [TASK_ID, SIBLING_TASK_ID]) {
    if ($isNotNil(taskConfig.ACTIVE_TASKS.get(taskId))) {
      pending += 1;
    }
  }

  if (pending > 1) {
    report("both b14 tasks are active, so the hand in closes both and pays %s twice", TASK_REWARD);
  }

  setPortableStoreValue<TCount>(ACTOR_ID, MONEY_BEFORE_KEY, registry.actor.money());
  setPortableStoreValue<TCount>(ACTOR_ID, TASKS_PENDING_KEY, pending);
}

/**
 * Assert the reward matches what was pending when the hand in happened.
 *
 * @param context - Running flow context.
 */
function expectRewardPaid(context: CheckContext): void {
  const before: TCount = getPortableStoreValue<TCount>(ACTOR_ID, MONEY_BEFORE_KEY, -1);
  const pending: TCount = getPortableStoreValue<TCount>(ACTOR_ID, TASKS_PENDING_KEY, 0);

  if (before < 0) {
    return report("no reward baseline recorded, the hand in happened outside this walk");
  }

  context.expectEqual(registry.actor.money() - before, TASK_REWARD * pending, "reward_money paid");
}

/**
 * Assert the task title resolved to something.
 *
 * @param context - Running flow context.
 * @param when - What portion state the title is being checked under.
 */
function expectTitleResolves(context: CheckContext, when: TLabel): void {
  // Refreshes the title from the condlist without re-giving the task: `update` recomputes it, and a
  // second `giveTask` would hand the engine another game task for the same id, so completing it later
  // fires the completion notification once per copy.
  evaluateTaskState(TASK_ID);

  const task: Nillable<TaskObject> = taskConfig.ACTIVE_TASKS.get(TASK_ID);

  if ($isNil(task)) {
    return context.fail(`title resolves ${when}`, "task is not active");
  }

  const title: Nillable<TLabel> = task.currentTitle;

  context.expect(
    $isNotNil(title) && title !== "",
    `title resolves ${when}`,
    `title condlist yielded '${tostring(title)}'`
  );
}

/**
 * Put the actor where the robbery expects it: inside `zat_b14_robbery_start`.
 *
 * Standing outside that zone is what turns the squad hostile. `zat_b14_stalker_3`'s `remark@robbery`
 * carries `{!actor_in_zone(zat_b14_robbery_start)} walker@fight %=set_squad_enemy_to_actor(...)%`, so
 * arriving anywhere else means they open fire instead of talking.
 *
 * The zone's own centre is not that spot, so fixed coordinates are used and the zone is consulted only
 * to confirm they land inside it.
 *
 * @param context - Running flow context.
 */
function teleportActorToRobbery(context: CheckContext): void {
  const zone: Nillable<GameObject> = registry.zones.get(ROBBERY_ZONE);

  context.expectNoThrow(
    () => teleportActorToPosition(ROBBERY_POSITION),
    "teleport below",
    "teleportActorToPosition(ROBBERY_POSITION)"
  );

  const arrival: Vector = registry.actor.position();

  report("arrived at %.3f %.3f %.3f", arrival.x, arrival.y, arrival.z);

  // `sr_cutscene@coming` in `zat_b14_cutscene_robbery.ltx` runs `teleport_actor` to its own `point`
  // when the robbery starts, so the actor does not stay here: this teleport exists to be inside the
  // trigger volume when the cutscene fires, and the cutscene decides where the hold up is played out.
  report("the robbery cutscene will move the actor to its own anchor once it fires");

  // Standing outside the trigger volume is what turns the squad hostile, so it is worth stating
  // outright rather than leaving it to be inferred from being shot at.
  if ($isNil(zone)) {
    return report("'%s' is not registered, cannot confirm the actor is inside it", ROBBERY_ZONE);
  }

  context.expect(
    zone.inside(registry.actor.position()),
    "inside the robbery zone",
    `actor is outside '${ROBBERY_ZONE}', so the stalkers will open fire instead of talking`
  );
}

/**
 * Put the chain's artefact in the actor's hands without ever ending up with two of them.
 *
 * @param context - Running flow context.
 */
function moveArtefactToActor(context: CheckContext): void {
  if (actorHasItem(QUEST_ARTEFACT)) {
    return report("actor picked '%s' up already, leaving it alone", QUEST_ARTEFACT);
  }

  const placed: Nillable<ServerObject> = getServerObjectByStoryId(ARTEFACT_STORY_ID);

  if ($isNil(placed)) {
    return context.fail(
      "artefact available",
      `'${ARTEFACT_STORY_ID}' no longer exists, so there is nothing to move into the inventory`
    );
  }

  report("moving '%s' out of the world and into the inventory", QUEST_ARTEFACT);

  context.expectNoThrow(
    () => {
      registry.simulator.release(placed, true);
      registry.simulator.create(
        QUEST_ARTEFACT,
        registry.actor.position(),
        registry.actor.level_vertex_id(),
        registry.actor.game_vertex_id(),
        registry.actor.id()
      );
    },
    "move the artefact",
    `release '${ARTEFACT_STORY_ID}' and recreate it on the actor`
  );
}

/**
 * Zaton b14 strange occurrence chain, walked along the quest's own geography: Beard, the artefact, the
 * robbery below, back to Beard, hand in.
 */
export function run(): ICheckResult {
  return runFlow($dirname, $filename, {
    requires: { level: "zaton" },
    steps: [
      {
        name: "at Beard, quest given",
        arrange: (context: CheckContext): void => {
          context.expectNoThrow(
            () => teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH),
            "teleport to Beard",
            `teleportActorToPatrol('${BASE_WALK_PATH}', '${BASE_LOOK_PATH}')`
          );

          setInfoPortion(infoPortions.zat_b14_recon_place, true);

          giveFreshTask(TASK_ID);
        },
        verify: (context: CheckContext): void => {
          context.expect(
            hasInfoPortion(ON_INIT_PORTION),
            "on_init applied",
            `expected giving the task to hand out '${ON_INIT_PORTION}'`
          );
          context.expectEqual(evaluateTaskState(TASK_ID), null, "state with no branch satisfied");
          expectTitleResolves(context, "with no progress portions");
        },
        handOff: "run again to travel to the artefact",
      },
      {
        name: "at the artefact, still placed in the world",
        arrange: (context: CheckContext): void => {
          const placed: Nillable<ServerObject> = getServerObjectByStoryId(ARTEFACT_STORY_ID);

          if ($isNil(placed)) {
            return report("'%s' does not exist, staying put", ARTEFACT_STORY_ID);
          }

          context.expectNoThrow(
            () => teleportActorToPosition(ARTEFACT_POSITION, placed.position),
            "teleport to the artefact",
            "teleportActorToPosition(ARTEFACT_POSITION)"
          );

          // `{+zat_b14_actor_in_up_point_zone} zat_b14_take_artefact_name` is a branch of its own.
          setInfoPortion(infoPortions.zat_b14_actor_in_up_point_zone, true);
        },
        verify: (context: CheckContext): void => {
          context.expect(
            $isNotNil(getServerObjectByStoryId(ARTEFACT_STORY_ID)),
            "artefact placed",
            `'${ARTEFACT_STORY_ID}' is not in the world, the chain cannot be walked`
          );
          expectTitleResolves(context, "at the up point");
        },
        handOff: "the artefact is here - pick it up by hand if you want to, then run again",
      },
      {
        name: "below, stalkers come for the artefact",
        arrange: (context: CheckContext): void => {
          teleportActorToRobbery(context);

          moveArtefactToActor(context);

          setInfoPortion(infoPortions.zat_b14_take_item, true);
          setInfoPortion(infoPortions.zat_b14_stalker_robbery_cutscene_start, false);
          setInfoPortion(infoPortions.zat_b14_actor_enemy, false);
        },
        verify: (context: CheckContext): void => {
          expectTitleResolves(context, "with the item taken");
        },
        handOff:
          "stay in the zone with your weapon holstered and let them walk over. Once one is within a " +
          "couple of metres he opens the robbery dialog: hand the artefact over, or refuse and take " +
          "the punch. Either way, run again afterwards",
        advanceWhen: (): boolean => hasInfoPortion(infoPortions.zat_b14_stalker_robbery_cutscene_end),
      },
      {
        name: "back at Beard",
        arrange: (context: CheckContext): void => {
          context.expectNoThrow(
            () => teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH),
            "teleport to Beard",
            `teleportActorToPatrol('${BASE_WALK_PATH}', '${BASE_LOOK_PATH}')`
          );
        },
        verify: (context: CheckContext): void => {
          expectTitleResolves(context, "after the robbery");
          context.expectEqual(evaluateTaskState(TASK_ID), null, "state before the item is handed over");
        },
        handOff: "hand the item to Beard, or run again and the replica is applied for you",
      },
      {
        name: "quest finished, reward_money paid",
        arrange: (context: CheckContext): void => {
          if (hasInfoPortion(infoPortions.zat_b14_give_item_linker)) {
            return report("item already handed over in play, nothing to mirror");
          }

          const beard: Nillable<GameObject> = getObjectByStoryId(BEARD_STORY_ID);

          if ($isNil(beard)) {
            return context.fail("mirror the replica", `'${BEARD_STORY_ID}' is not online, cannot transfer the item`);
          }

          const dialogs: AnyCallablesModule = getExtern<AnyCallablesModule>("dialogs_zaton");

          rememberPendingReward();

          // Exactly what selecting the phrase does: run its action, then apply its `give_info`.
          context.expectNoThrow(
            () => dialogs.zat_b14_transfer_artefact(registry.actor, beard),
            "mirror the replica",
            "dialogs_zaton.zat_b14_transfer_artefact()"
          );
          setInfoPortion(infoPortions.zat_b14_give_item_linker, true);
        },
        verify: (context: CheckContext): void => {
          context.expect(
            hasInfoPortion(infoPortions.zat_b14_give_item_linker),
            "hand in registered",
            "expected 'zat_b14_give_item_linker' to be set once the item is handed over"
          );
        },
        handOff: "run again to confirm the completion effects and the reward",
        advanceWhen: (): boolean => hasInfoPortion(infoPortions.zat_b14_smart_terrain_open),
      },
      {
        name: "completion effects applied by the manager",
        verify: (context: CheckContext): void => {
          context.expect(
            hasInfoPortion(infoPortions.zat_b14_smart_terrain_open),
            "on_complete applied",
            `expected on_complete to give '${infoPortions.zat_b14_smart_terrain_open}'`
          );
          context.expect(
            $isNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
            "task closed",
            "task is still active, so the manager never deactivated it"
          );
          context.expect(
            !actorHasItem(QUEST_ARTEFACT),
            "artefact taken",
            `'${QUEST_ARTEFACT}' is still in the inventory`
          );

          expectRewardPaid(context);
        },
      },
    ],
  });
}

/**
 * Send the flow back to its first step.
 */
export function reset(): void {
  // Also puts the chain's portions back, so a walk does not leave the quest half progressed and its
  // dialogs offering steps the player never took. Real progress in this chain is discarded with it.
  setInfoPortion(ON_INIT_PORTION, false);
  setInfoPortion(infoPortions.zat_b14_recon_place, false);
  setInfoPortion(infoPortions.zat_b14_learn_about_strange_occurrence_by_stalkers_give_task, false);
  setInfoPortion(infoPortions.zat_b14_give_item_linker, false);
  setInfoPortion(infoPortions.zat_b14_take_item, false);
  setInfoPortion(infoPortions.zat_b14_actor_in_up_point_zone, false);
  setInfoPortion(infoPortions.zat_b14_smart_terrain_open, false);
  setInfoPortion(infoPortions.zat_a2_linker_b14_quest_wrong_done, false);
  setInfoPortion(infoPortions.jup_b6_half_artefact_from_b14_given_to_sci, false);
  setInfoPortion(infoPortions.zat_b14_stalker_robbery, false);
  setInfoPortion(infoPortions.zat_b14_stalker_robbery_cutscene_start, false);
  setInfoPortion(infoPortions.zat_b14_stalker_robbery_cutscene_end, false);

  report("cleared the b14 portions this flow drives, which re-locks the b29 artefact hunt");

  resetFlow($dirname, $filename);
}
