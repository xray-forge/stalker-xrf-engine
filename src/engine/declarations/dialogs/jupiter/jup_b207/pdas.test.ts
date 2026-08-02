import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { questItems } from "@/engine/constants/items/quest_items";
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
 * Verify a predicate flips once the provided section is in the actor inventory.
 */
function checkHasItemPredicate(name: TName, section: TSection, expected: boolean = true): void {
  mockActorWith([]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expected);

  mockActorWith([section]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expected);
}

/**
 * Verify an action transfers the expected section from the actor to the NPC speaker.
 */
function checkTransferFromActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section, count);
  }
}

/**
 * Verify an action transfers the expected section from the NPC speaker to the actor.
 */
function checkTransferToActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
  }
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b207/pdas");
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

describe("jup_b207_generic_decrypt_need_dialog_precond", () => {
  it("should require both the contract PDA and the blackbox", () => {
    expect(
      callDialogsBinding("jup_b207_generic_decrypt_need_dialog_precond", [registry.actor, MockGameObject.mock()])
    ).toBe(false);

    mockActorWith(["jup_b207_merc_pda_with_contract"]);
    expect(
      callDialogsBinding("jup_b207_generic_decrypt_need_dialog_precond", [registry.actor, MockGameObject.mock()])
    ).toBe(false);

    mockActorWith(["jup_b207_merc_pda_with_contract", questItems.jup_b9_blackbox]);
    expect(
      callDialogsBinding("jup_b207_generic_decrypt_need_dialog_precond", [registry.actor, MockGameObject.mock()])
    ).toBe(true);
  });
});

describe("jup_b207_actor_has_dealers_pda", () => {
  it("should check the dealer PDA", () => {
    checkHasItemPredicate("jup_b207_actor_has_dealers_pda", "device_pda_zat_b5_dealer");
  });
});

describe("jup_b207_sell_dealers_pda", () => {
  it("should take the dealer PDA and pay for it", () => {
    mockActorWith(["device_pda_zat_b5_dealer"]);

    checkTransferFromActor("jup_b207_sell_dealers_pda", "device_pda_zat_b5_dealer");
    expect(giveMoneyToActor).toHaveBeenCalledWith(4000);
  });
});

describe("jup_b207_give_dealers_pda", () => {
  it("should take the dealer PDA without payment", () => {
    mockActorWith(["device_pda_zat_b5_dealer"]);

    checkTransferFromActor("jup_b207_give_dealers_pda", "device_pda_zat_b5_dealer");
    expect(giveMoneyToActor).not.toHaveBeenCalled();
  });
});

describe("jup_b207_actor_has_merc_pda_with_contract", () => {
  it("should check the mercenary contract PDA", () => {
    checkHasItemPredicate("jup_b207_actor_has_merc_pda_with_contract", "jup_b207_merc_pda_with_contract");
  });
});

describe("jup_b207_sell_merc_pda_with_contract", () => {
  it("should take the contract PDA and pay for it", () => {
    mockActorWith(["jup_b207_merc_pda_with_contract"]);

    checkTransferFromActor("jup_b207_sell_merc_pda_with_contract", "jup_b207_merc_pda_with_contract");
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
  });
});

describe("jup_b207_transfer_blackmail_reward", () => {
  it("should take the contract PDA as the blackmail reward", () => {
    mockActorWith(["jup_b207_merc_pda_with_contract"]);

    checkTransferFromActor("jup_b207_transfer_blackmail_reward", "jup_b207_merc_pda_with_contract");
  });
});

describe("jup_b207_transfer_blackmail_reward_for_pda", () => {
  it("should give the abakan rifle in exchange for the PDA", () => {
    checkTransferToActor("jup_b207_transfer_blackmail_reward_for_pda", "wpn_abakan");
  });
});
