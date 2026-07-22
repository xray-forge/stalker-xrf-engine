import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { registerActor } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { TaskObject } from "@/engine/core/managers/tasks";
import { giveTaskReward } from "@/engine/core/managers/tasks/utils/tasks_rewards";
import { giveItemsToActor, giveMoneyToActor } from "@/engine/core/utils/reward";
import { resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward", () => ({
  giveItemsToActor: jest.fn(),
  giveMoneyToActor: jest.fn(),
}));

function createTaskWithRewards(money: string, items: string): TaskObject {
  return {
    id: "task",
    rewardMoneyConditionList: parseConditionsList(money),
    rewardItemsConditionList: parseConditionsList(items),
  } as TaskObject;
}

describe("giveTaskReward", () => {
  beforeEach(() => {
    resetRegistry();
    registerActor(MockGameObject.mockActor());

    dialogConfig.ACTIVE_SPEAKER = null;

    resetFunctionMock(giveItemsToActor);
    resetFunctionMock(giveMoneyToActor);
  });

  it("should give task rewards directly to actor despite active dialog speaker", () => {
    dialogConfig.ACTIVE_SPEAKER = MockGameObject.mock();

    giveTaskReward(createTaskWithRewards("500", "medkit:medkit:bandage"));

    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
    expect(giveItemsToActor).toHaveBeenCalledTimes(2);
    expect(giveItemsToActor).toHaveBeenCalledWith("medkit", 2);
    expect(giveItemsToActor).toHaveBeenCalledWith("bandage", 1);
  });

  it("should not grant rewards when reward condlists are empty", () => {
    giveTaskReward(createTaskWithRewards("", ""));

    expect(giveMoneyToActor).not.toHaveBeenCalled();
    expect(giveItemsToActor).not.toHaveBeenCalled();
  });
});
