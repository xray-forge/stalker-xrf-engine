import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { drugs } from "@/engine/constants/items/drugs";
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

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/pri_a15/sokolov");
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

describe("pri_a15_sokolov_actor_has_note", () => {
  it("should check the Sokolov note", () => {
    checkHasItemPredicate("pri_a15_sokolov_actor_has_note", questItems.jup_b205_sokolov_note);
  });
});

describe("pri_a15_sokolov_actor_has_not_note", () => {
  it("should invert the Sokolov note check", () => {
    checkHasItemPredicate("pri_a15_sokolov_actor_has_not_note", questItems.jup_b205_sokolov_note, false);
  });
});

describe("pri_a15_sokolov_actor_give_note", () => {
  it("should exchange the note for an army medkit", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([questItems.jup_b205_sokolov_note]);

    callDialogsBinding("pri_a15_sokolov_actor_give_note", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b205_sokolov_note);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army);
  });
});
