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
  require("@/engine/declarations/dialogs/jupiter/jup_b10/ufo");
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

describe("jup_b10_ufo_memory_give_to_npc", () => {
  it("should take the UFO memory from the actor", () => {
    checkTransferFromActor("jup_b10_ufo_memory_give_to_npc", questItems.jup_b10_ufo_memory);
  });
});

describe("jup_b10_ufo_memory_give_to_actor", () => {
  it("should check the UFO memory before giving it away", () => {
    checkHasItemPredicate("jup_b10_ufo_memory_give_to_actor", questItems.jup_b10_ufo_memory);
  });
});

describe("jup_b10_ufo_memory_2_give_to_actor", () => {
  it("should give the second UFO memory to the actor", () => {
    checkTransferToActor("jup_b10_ufo_memory_2_give_to_actor", questItems.jup_b10_ufo_memory_2);
  });
});

describe("jup_b10_ufo_has_money_1000", () => {
  it("should check the 1000 money threshold", () => {
    mockActorWith([], { money: 999 });
    expect(callDialogsBinding("jup_b10_ufo_has_money_1000")).toBe(false);

    mockActorWith([], { money: 1000 });
    expect(callDialogsBinding("jup_b10_ufo_has_money_1000")).toBe(true);
  });
});

describe("jup_b10_ufo_hasnt_money_1000", () => {
  it("should invert the 1000 money threshold", () => {
    mockActorWith([], { money: 999 });
    expect(callDialogsBinding("jup_b10_ufo_hasnt_money_1000")).toBe(true);

    mockActorWith([], { money: 1000 });
    expect(callDialogsBinding("jup_b10_ufo_hasnt_money_1000")).toBe(false);
  });
});

describe("jup_b10_ufo_has_money_3000", () => {
  // Named after 3000 but bound to a 2000 threshold, same as the original game script.
  it("should check the 2000 money threshold", () => {
    mockActorWith([], { money: 1999 });
    expect(callDialogsBinding("jup_b10_ufo_has_money_3000")).toBe(false);

    mockActorWith([], { money: 2000 });
    expect(callDialogsBinding("jup_b10_ufo_has_money_3000")).toBe(true);
  });
});

describe("jup_b10_ufo_hasnt_money_3000", () => {
  it("should invert the 2000 money threshold", () => {
    mockActorWith([], { money: 1999 });
    expect(callDialogsBinding("jup_b10_ufo_hasnt_money_3000")).toBe(true);

    mockActorWith([], { money: 2000 });
    expect(callDialogsBinding("jup_b10_ufo_hasnt_money_3000")).toBe(false);
  });
});

describe("jup_b10_ufo_relocate_money_1000", () => {
  it("should take the smaller UFO fee", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("jup_b10_ufo_relocate_money_1000", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 1000);
  });
});

describe("jup_b10_ufo_relocate_money_3000", () => {
  it("should take the larger UFO fee", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("jup_b10_ufo_relocate_money_3000", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 2000);
  });
});

describe("jup_b10_actor_has_ufo_memory", () => {
  it("should check the UFO memory", () => {
    checkHasItemPredicate("jup_b10_actor_has_ufo_memory", questItems.jup_b10_ufo_memory);
  });
});
