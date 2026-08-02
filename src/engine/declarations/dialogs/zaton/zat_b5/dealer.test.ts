import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyArgs, AnyObject, TCount, TName } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { registry } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { giveMoneyToActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
}

function checkMoneyReward(name: TName, amount: TCount): void {
  callDialogsBinding(name, [registry.actor, MockGameObject.mock()]);

  expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  expect(giveMoneyToActor).toHaveBeenCalledWith(amount);
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(giveMoneyToActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b5/dealer");
});

describe("zat_b5_stalker_transfer_money", () => {
  it("should pay the stalker reward and reveal the treasure", () => {
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("zat_b5_stalker_transfer_money");

    expect(giveMoneyToActor).toHaveBeenCalledWith(2500);
    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_7");

    giveTreasureCoordinates.mockRestore();
  });
});
describe("zat_b5_dealer_full_revard", () => {
  it("should pay the full dealer reward", () => {
    checkMoneyReward("zat_b5_dealer_full_revard", 6000);
  });
});
describe("zat_b5_dealer_easy_revard", () => {
  it("should pay the reduced dealer reward", () => {
    checkMoneyReward("zat_b5_dealer_easy_revard", 3000);
  });
});
describe("zat_b5_bandits_revard", () => {
  it("should pay the bandit reward and reveal the treasure", () => {
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("zat_b5_bandits_revard");

    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);
    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_20");

    giveTreasureCoordinates.mockRestore();
  });
});
