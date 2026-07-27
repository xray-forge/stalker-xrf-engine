import { ServerObject, Vector } from "xray16/alias";
import { createVector, Nillable, TCount, TName, TSection } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { expect, expectEqual, report, requires, step } from "@/engine/checks/framework";
import {
  expectActorMoneyGained,
  expectTaskTextResolves,
  rememberActorMoney,
  settleTask,
} from "@/engine/checks/framework/world";
import { infoPortions } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { getServerObjectByStoryId } from "@/engine/core/database";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasItem } from "@/engine/core/utils/item";
import { teleportActorToPatrol, teleportActorToPosition } from "@/engine/core/utils/position";

const TASK_ID: TName = "zat_b14_learn_about_strange_occurrence";
const SIBLING_TASK_ID: TName = "zat_b14_learn_about_strange_occurrence_by_stalkers";
const QUEST_ARTEFACT: TSection = artefacts.af_quest_b14_twisted;
const ARTEFACT_STORY_ID: TName = "zat_b14_artefact_id";

const BASE_WALK_PATH: TName = "zat_b29_actor_base_walk";
const BASE_LOOK_PATH: TName = "zat_b29_actor_base_look";

const TASK_REWARD: TCount = 3_000;
const MONEY_BEFORE_KEY: TName = "xrf_b14_money";

/**
 * Zaton b14 strange occurrence chain, watched along the quest's own geography: Beard, the artefact,
 * the robbery below, back to Beard, hand in.
 *
 * Completing this is what opens the b29 artefact hunt, via `on_complete = %+zat_b14_smart_terrain_open%`.
 */
requires({
  level: "zaton",
  state: [
    {
      holds: (): boolean => !hasInfoPortion(infoPortions.zat_b14_give_item_linker),
      missing: "the item has already been handed in, so this chain is finished - load a save from before it",
    },
  ],
});

step("quest taken from Beard", {
  reached: (): boolean =>
    hasInfoPortion(infoPortions.zat_b14_recon_place) && $isNotNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
  travel: (): void => {
    teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH);
    rememberActorMoney(MONEY_BEFORE_KEY);
  },
  verify: (): void => {
    expect(
      hasInfoPortion(infoPortions.zat_b14_learn_about_strange_occurrence_give_task),
      "on_init applied",
      "expected giving the task to hand out 'zat_b14_learn_about_strange_occurrence_give_task'"
    );

    const task: Nillable<TaskObject> = settleTask(TASK_ID);

    expectEqual(task?.state, null, "state with no branch satisfied");
    expectTaskTextResolves(task, TASK_ID, "with no progress portions");

    expect(
      $isNotNil(getServerObjectByStoryId(ARTEFACT_STORY_ID)) || actorHasItem(QUEST_ARTEFACT),
      "artefact accounted for",
      `'${ARTEFACT_STORY_ID}' is not in the world and the actor is not carrying it`
    );
  },
  handOff: "ask Beard about available work and the sunken ship",
});

step("artefact taken", {
  reached: (): boolean => hasInfoPortion(infoPortions.zat_b14_take_item),
  travel: (): void => {
    const artefactPosition: Vector = createVector(412.489, -0.942, 231.008);
    const placed: Nillable<ServerObject> = getServerObjectByStoryId(ARTEFACT_STORY_ID);

    if ($isNotNil(placed)) {
      teleportActorToPosition(artefactPosition, placed.position);
    }
  },
  verify: (): void => {
    expect(actorHasItem(QUEST_ARTEFACT), "artefact carried", `'${QUEST_ARTEFACT}' is not in the inventory`);
    expectTaskTextResolves(settleTask(TASK_ID), TASK_ID, "with the item taken");
  },
  handOff: "pick the artefact up - you have been taken to where it sits",
});

step("robbed below for it", {
  reached: (): boolean => hasInfoPortion(infoPortions.zat_b14_stalker_robbery_cutscene_end),
  travel: (): void => {
    const robberyPosition: Vector = createVector(410.694, -5.751, 219.537);

    teleportActorToPosition(robberyPosition);
  },
  handOff:
    "go down and let them walk over with your weapon holstered - 'remark@robbery' waits on " +
    "'+zat_b14_robbery_nowpn_actor', then one opens the dialog within 2 m: hand it over or take the punch",
});

step("handed in, reward_money paid", {
  reached: (): boolean => hasInfoPortion(infoPortions.zat_b14_give_item_linker),
  travel: (): void => teleportActorToPatrol(BASE_WALK_PATH, BASE_LOOK_PATH),
  verify: (): void => {
    let pending: TCount = 0;

    for (const taskId of [TASK_ID, SIBLING_TASK_ID]) {
      if ($isNotNil(taskConfig.ACTIVE_TASKS.get(taskId))) {
        pending += 1;
      }
    }

    if (pending > 1) {
      report("both b14 tasks are active, so the hand in closes both and pays %s twice", TASK_REWARD);
    }

    expect(!actorHasItem(QUEST_ARTEFACT), "artefact taken", `'${QUEST_ARTEFACT}' is still in the inventory`);
    expectActorMoneyGained(MONEY_BEFORE_KEY, TASK_REWARD, "reward_money paid");
  },
  handOff: "hand the item to Beard",
});

step("completion effects applied and the b29 hunt unlocked", {
  reached: (): boolean =>
    hasInfoPortion(infoPortions.zat_b14_smart_terrain_open) && $isNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
  verify: (): void => {
    expect(
      hasInfoPortion(infoPortions.zat_b14_smart_terrain_open),
      "on_complete applied",
      "expected on_complete to give 'zat_b14_smart_terrain_open', which is what opens the b29 hunt"
    );
  },
  handOff: "nothing to do, the task manager deactivates it on its next update",
});
