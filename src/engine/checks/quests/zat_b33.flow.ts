import { Nillable, TCount, TLabel, TName } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { expect, expectEqual, report, requires, step } from "@/engine/checks/framework";
import { checkTaskText, teleportNearZone, teleportToStoryObject } from "@/engine/checks/framework/world";
import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { storyIds } from "@/engine/constants/story_ids";
import { taskIds } from "@/engine/constants/task_ids";
import { zoneNames } from "@/engine/constants/zone_names";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { actorHasItem } from "@/engine/core/utils/item";

const TASK_ID: TName = taskIds.zat_b33_zaporojec;
const TASK_TITLE: TLabel = "zat_b33_zaporojec_name";
const SNAG_STORY_ID: TName = storyIds.zat_b33_stalker_snag;
const MECHANIC_STORY_ID: TName = storyIds.zat_a2_stalker_mechanic;
const TREASURE_STORY_ID: TName = storyIds.zat_b33_treasure;
const TUTOR_ZONE: TName = zoneNames.zat_b33_tutor;
const MECHANIC_PRICE: TCount = 500;

/**
 * @returns What became of the container, or null while the actor still has it to give.
 */
function resolveContainerFate(): Nillable<TLabel> {
  if (hasInfoPortion(infoPortions.zat_b33_package_returned)) {
    return "handed to Snag and split";
  } else if (hasInfoPortion(infoPortions.zat_b33_find_package) && !actorHasItem(questItems.zat_b33_safe_container)) {
    return "cut open by Cardan";
  }

  return null;
}

/**
 * Zaton b33 Zaporozhets chain, watched to whichever end the actor takes it: Snag asks for his stash back,
 * the container comes out from under the wreck, and it is either split with him or cut open by Cardan for
 * `MECHANIC_PRICE`.
 */
requires({
  level: "zaton",
  state: [
    {
      holds: (): boolean => $isNil(resolveContainerFate()),
      missing: "the container has already been dealt with, so this chain is finished - load a save from before it",
    },
  ],
});

step("1 - Snag asked for his stash back", {
  reached: (): boolean => hasInfoPortion(infoPortions.zat_b33_safe_container),
  travel: (): void => void teleportToStoryObject(SNAG_STORY_ID),
  verify: (): void => {
    expect(
      hasInfoPortion(infoPortions.zat_b33_stalker_snag_setup),
      "dialog was entered from its root",
      "'zat_b33_safe_container' only sits under phrase 0 of 'zat_b33_stalker_snag_about_cache_dialog', which gives " +
        `'${infoPortions.zat_b33_stalker_snag_setup}' on the way in`
    );
  },
  handOff: "talk to Snag in Skadovsk and agree to fetch the container out of the Zaporozhets",
});

step("2 - Zaporozhets task handed out", {
  reached: (): boolean => hasInfoPortion(infoPortions.zat_b33_task_gived),
  verify: (): void => {
    const task: Nillable<TaskObject> = checkTaskText(TASK_ID, "once the task is handed out");

    if ($isNotNil(task)) {
      expectEqual(task?.state, null, "state with no branch satisfied");
      expectEqual(task?.currentTitle, TASK_TITLE, "title resolves to the only branch there is");
    }
  },
  handOff: "stay near Snag a moment, his animpoint hands the task out on its next update",
});

step("3 - container out of the stash", {
  reached: (): boolean => hasInfoPortion(infoPortions.zat_b33_find_package),
  travel: (): void => {
    if (!teleportNearZone(TUTOR_ZONE)) {
      void teleportToStoryObject(TREASURE_STORY_ID);
    }
  },
  verify: (): void => {
    if ($isNil(resolveContainerFate())) {
      expect(
        actorHasItem(questItems.zat_b33_safe_container),
        "container carried",
        `'${questItems.zat_b33_safe_container}' is not in the inventory, though the effect that gives the portion ` +
          "gives the item in the same breath"
      );
    }

    report("snork ambush: %s", hasInfoPortion(infoPortions.zat_b33_snork_spawn_05) ? "sprung" : "not sprung");
    report(
      "who will open it: %s",
      hasInfoPortion(infoPortions.zat_b33_refuse_task) ? "Cardan, the job was turned down" : "Snag or Cardan"
    );

    checkTaskText(TASK_ID, "with the container found");
  },
  handOff:
    "you are put down a few metres short of the Zaporozhets on purpose - walk the rest of the way in and take the " +
    "container out of the stash. Turning Snag down does not empty it, so this is still worth doing",
});

step("4 - container opened", {
  reached: (): boolean => $isNotNil(resolveContainerFate()),
  travel: (): void =>
    void teleportToStoryObject(hasInfoPortion(infoPortions.zat_b33_refuse_task) ? MECHANIC_STORY_ID : SNAG_STORY_ID),
  verify: (): void => {
    report("fate of the container: %s", tostring(resolveContainerFate()));

    if (hasInfoPortion(infoPortions.zat_b33_package_returned)) {
      return report("talked Snag out, split rewards");
    }

    report("Cardan handed over all five rewards for %s, and none of the '_gived' portions with them", MECHANIC_PRICE);
  },
  handOff:
    "bring the container back to Snag and haggle over what is inside - you have ten points to spend - or pay Cardan " +
    `${MECHANIC_PRICE} in Skadovsk to cut it open and keep everything`,
});

step("5 - task settled and the reputation chain opened", {
  reached: (): boolean =>
    $isNotNil(resolveContainerFate()) &&
    hasInfoPortion(infoPortions.zat_b52_reputation_task_open) &&
    $isNil(taskConfig.ACTIVE_TASKS.get(TASK_ID)),
  verify: (): void => {
    const isReturned: boolean = hasInfoPortion(infoPortions.zat_b33_package_returned);

    expect(
      hasInfoPortion(infoPortions.zat_b52_reputation_task_open),
      "settling hook applied",
      `expected ${isReturned ? "on_complete" : "on_reversed"} to give 'zat_b52_reputation_task_open', which is what ` +
        "makes Snag react to one of Nimble's weapons and so opens the b52 chain"
    );
    report("closed through: %s", isReturned ? "condlist_1, complete" : "condlist_0, reversed");
  },
  handOff: "nothing to do, the task manager deactivates it on its next update",
});
