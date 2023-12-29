import { registry } from "@/engine/core/database";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { TaskObject } from "@/engine/core/managers/tasks";
import { parseStringsList, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { giveMoneyToActor, transferItemsToActor } from "@/engine/core/utils/reward";
import { GameObject, Optional, TCount, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Give possible task rewards.
 * - money
 * - items list based on task config
 *
 * @param task - task object to give rewards for
 */
export function giveTaskReward(task: TaskObject): void {
  const money: Optional<string> = pickSectionFromCondList(
    registry.actor,
    registry.actor,
    task.rewardMoneyConditionList
  );
  const itemsList: Optional<string> = pickSectionFromCondList(
    registry.actor,
    registry.actor,
    task.rewardItemsConditionList
  );

  logger.info("Give task rewards:", task.id, money, itemsList);

  if (money !== null) {
    giveMoneyToActor(tonumber(money) as TCount);
  }

  if (itemsList !== null) {
    const rewards: LuaTable<TName, TCount> = new LuaTable();

    for (const [, name] of parseStringsList(itemsList)) {
      rewards.set(name, rewards.has(name) ? rewards.get(name) + 1 : 1);
    }

    for (const [item, count] of rewards) {
      transferItemsToActor(dialogConfig.ACTIVE_SPEAKER as GameObject, item, count);
    }
  }
}
