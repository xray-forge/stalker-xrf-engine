import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { detectors } from "@/engine/constants/items/detectors";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
}

function checkHasItemPredicate(name: TName, section: TSection, expected: boolean = true): void {
  mockActorWith([]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expected);

  mockActorWith([section]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expected);
}

function checkMoneyPredicate(name: TName, amount: TCount, expectedWhenEnough: boolean = true): void {
  mockActorWith([], { money: amount - 1 });
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expectedWhenEnough);

  mockActorWith([], { money: amount });
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expectedWhenEnough);
}

function checkMoneyTransfer(name: TName, amount: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  expect(transferMoneyFromActor).toHaveBeenCalledTimes(1);
  expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, amount);
}

function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b57/gas");
});

describe("zat_b57_stalker_reward_to_actor_detector", () => {
  it("should give the elite detector and reveal the treasure", () => {
    const npc: GameObject = MockGameObject.mock();
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("zat_b57_stalker_reward_to_actor_detector", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, detectors.detector_elite);
    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_54");

    giveTreasureCoordinates.mockRestore();
  });
});
describe("actor_has_gas", () => {
  it("should check the gas canister", () => {
    checkHasItemPredicate("actor_has_gas", questItems.zat_b57_gas);
  });
});
describe("actor_has_not_gas", () => {
  it("should invert the gas canister check", () => {
    checkHasItemPredicate("actor_has_not_gas", questItems.zat_b57_gas, false);
  });
});
describe("zat_b57_actor_has_money", () => {
  it("should check the gas price threshold", () => {
    checkMoneyPredicate("zat_b57_actor_has_money", 2000);
  });
});
describe("zat_b57_actor_hasnt_money", () => {
  it("should invert the gas price threshold", () => {
    checkMoneyPredicate("zat_b57_actor_hasnt_money", 2000, false);
  });
});
describe("zat_b57_transfer_gas_money", () => {
  it("should take the gas price", () => {
    checkMoneyTransfer("zat_b57_transfer_gas_money", 2000);
  });
});
