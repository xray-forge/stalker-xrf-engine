import { GameObject } from "xray16/alias";
import { Nillable, TCount, TName } from "xray16/lib";
import { $filename, $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { parseStringsList, pickSectionFromCondList } from "@/engine/core/ini";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { TaskObject } from "@/engine/core/managers/tasks";
import { LuaLogger } from "@/engine/core/utils/logging";
import { giveMoneyToActor, transferItemsToActor } from "@/engine/core/utils/reward";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Give possible task rewards.
 * - money
 * - items list based on task config.
 *
 * @param task - Task object to give rewards for.
 */
export function giveTaskReward(task: TaskObject): void {
  const money: Nillable<string> = pickSectionFromCondList(
    registry.actor,
    registry.actor,
    task.rewardMoneyConditionList
  );
  const itemsList: Nillable<string> = pickSectionFromCondList(
    registry.actor,
    registry.actor,
    task.rewardItemsConditionList
  );

  logger.info("Give task rewards: %s %s %s", task.id, money, itemsList);

  if ($isNotNil(money)) {
    giveMoneyToActor(tonumber(money) as TCount);
  }

  if ($isNotNil(itemsList)) {
    const rewards: LuaTable<TName, TCount> = new LuaTable();

    for (const [, name] of parseStringsList(itemsList)) {
      rewards.set(name, rewards.has(name) ? rewards.get(name) + 1 : 1);
    }

    for (const [item, count] of rewards) {
      transferItemsToActor(dialogConfig.ACTIVE_SPEAKER as GameObject, item, count);
    }
  }
}
