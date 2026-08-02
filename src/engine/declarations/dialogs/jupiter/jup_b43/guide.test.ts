import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { registry } from "@/engine/core/database";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
}

/**
 * Re-register the actor carrying the provided sections, dropping any previously given info portions.
 *
 * Inventory keys are index-suffixed so repeating the same section registers separate items, while
 * `object(section)` lookups still resolve by section.
 */
function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

/**
 * Verify a money reward action pays exactly the expected amount.
 */
function checkMoneyReward(name: TName, amount: TCount): void {
  callDialogsBinding(name, [registry.actor, MockGameObject.mock()]);

  expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  expect(giveMoneyToActor).toHaveBeenCalledWith(amount);
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b43/guide");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pay_cost_to_guide_to_pripyat", () => {
  it("should charge the Pripyat guide fee", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pay_cost_to_guide_to_pripyat", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 5000);
  });
});

describe("jup_b43_actor_has_5000_money", () => {
  it("should check the 5000 money threshold", () => {
    mockActorWith([], { money: 4999 });
    expect(callDialogsBinding("jup_b43_actor_has_5000_money")).toBe(false);

    mockActorWith([], { money: 5000 });
    expect(callDialogsBinding("jup_b43_actor_has_5000_money")).toBe(true);
  });
});

describe("jup_b43_actor_do_not_has_5000_money", () => {
  it("should invert the 5000 money threshold", () => {
    mockActorWith([], { money: 4999 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_5000_money")).toBe(true);

    mockActorWith([], { money: 5000 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_5000_money")).toBe(false);
  });
});

describe("jup_b43_reward_for_first_artefact", () => {
  it("should pay the first artefact reward", () => {
    checkMoneyReward("jup_b43_reward_for_first_artefact", 2500);
  });
});

describe("jup_b43_reward_for_second_artefact", () => {
  it("should pay the second artefact reward", () => {
    checkMoneyReward("jup_b43_reward_for_second_artefact", 3500);
  });
});

describe("jup_b43_reward_for_both_artefacts", () => {
  it("should pay the combined artefact reward", () => {
    checkMoneyReward("jup_b43_reward_for_both_artefacts", 6000);
  });
});
