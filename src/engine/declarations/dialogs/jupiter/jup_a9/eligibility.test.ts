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

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_a9/eligibility");
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

describe("jupiter_a9_actor_has_any_items", () => {
  it("should accept any of the mail and secondary documents", () => {
    expect(callDialogsBinding("jupiter_a9_actor_has_any_items")).toBe(false);

    for (const item of [
      questItems.jup_a9_delivery_info,
      questItems.jup_a9_evacuation_info,
      questItems.jup_a9_losses_info,
      questItems.jup_a9_power_info,
      questItems.jup_a9_conservation_info,
      questItems.jup_a9_way_info,
      questItems.jup_a9_meeting_info,
    ]) {
      mockActorWith([item]);
      expect(callDialogsBinding("jupiter_a9_actor_has_any_items")).toBe(true);
    }
  });
});

describe("jup_a9_actor_has_conservation_info", () => {
  it("should check the conservation document", () => {
    checkHasItemPredicate("jup_a9_actor_has_conservation_info", questItems.jup_a9_conservation_info);
  });
});

describe("jup_a9_actor_hasnt_conservation_info", () => {
  it("should invert the conservation document check", () => {
    checkHasItemPredicate("jup_a9_actor_hasnt_conservation_info", questItems.jup_a9_conservation_info, false);
  });
});

describe("actor_relocate_conservation_info", () => {
  it("should transfer the conservation document to the NPC", () => {
    checkTransferFromActor("actor_relocate_conservation_info", questItems.jup_a9_conservation_info);
  });
});

describe("jup_a9_actor_has_power_info", () => {
  it("should check the power document", () => {
    checkHasItemPredicate("jup_a9_actor_has_power_info", questItems.jup_a9_power_info);
  });
});

describe("jup_a9_actor_hasnt_power_info", () => {
  it("should invert the power document check", () => {
    checkHasItemPredicate("jup_a9_actor_hasnt_power_info", questItems.jup_a9_power_info, false);
  });
});

describe("actor_relocate_power_info", () => {
  it("should transfer the power document to the NPC", () => {
    checkTransferFromActor("actor_relocate_power_info", questItems.jup_a9_power_info);
  });
});

describe("jup_a9_actor_has_way_info", () => {
  it("should check the way document", () => {
    checkHasItemPredicate("jup_a9_actor_has_way_info", questItems.jup_a9_way_info);
  });
});

describe("jup_a9_actor_hasnt_way_info", () => {
  it("should invert the way document check", () => {
    checkHasItemPredicate("jup_a9_actor_hasnt_way_info", questItems.jup_a9_way_info, false);
  });
});

describe("actor_relocate_way_info", () => {
  it("should transfer the way document to the NPC", () => {
    checkTransferFromActor("actor_relocate_way_info", questItems.jup_a9_way_info);
  });
});
