import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
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
 * Make the actor report the provided item in exactly one equipment slot.
 */
function mockItemInSlot(slot: TCount, item: GameObject): void {
  MockGameObject.asMock(registry.actor).item_in_slot.mockImplementation(((requested: TCount) =>
    requested === slot ? item : null) as never);
}

/**
 * Verify a money reward action pays exactly the expected amount.
 */
function checkMoneyReward(name: TName, amount: TCount): void {
  callDialogsBinding(name, [registry.actor, MockGameObject.mock()]);

  expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  expect(giveMoneyToActor).toHaveBeenCalledWith(amount);
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
  require("@/engine/declarations/dialogs/jupiter/jup_a10/trade");
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

describe("actor_has_plant", () => {
  it("should check the b206 plant", () => {
    checkHasItemPredicate("actor_has_plant", questItems.jup_b206_plant);
  });
});

describe("actor_relocate_plant", () => {
  it("should transfer the b206 plant to the NPC", () => {
    checkTransferFromActor("actor_relocate_plant", questItems.jup_b206_plant);
  });
});

describe("jup_a10_proverka_wpn", () => {
  it("should reject an actor without an accepted weapon equipped", () => {
    expect(callDialogsBinding("jup_a10_proverka_wpn")).toBe(false);
  });

  it("should accept an accepted weapon in either the primary or secondary slot", () => {
    const rifle: GameObject = MockGameObject.mock({ section: weapons.wpn_gauss });

    mockItemInSlot(2, rifle);
    expect(callDialogsBinding("jup_a10_proverka_wpn")).toBe(true);

    mockItemInSlot(3, rifle);
    expect(callDialogsBinding("jup_a10_proverka_wpn")).toBe(true);
  });

  it("should reject a weapon that is not on the accepted list", () => {
    const pistol: GameObject = MockGameObject.mock({ section: weapons.wpn_pm });

    MockGameObject.asMock(registry.actor).item_in_slot.mockReturnValue(pistol as never);

    expect(callDialogsBinding("jup_a10_proverka_wpn")).toBe(false);
  });
});

describe("jup_a10_proverka_wpn_false", () => {
  it("should invert the accepted weapon check", () => {
    expect(callDialogsBinding("jup_a10_proverka_wpn_false", [registry.actor, MockGameObject.mock()])).toBe(true);

    MockGameObject.asMock(registry.actor).item_in_slot.mockReturnValue(
      MockGameObject.mock({ section: weapons.wpn_gauss }) as never
    );

    expect(callDialogsBinding("jup_a10_proverka_wpn_false", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("jup_a10_actor_has_money", () => {
  it("should require 7000 money by default", () => {
    mockActorWith([], { money: 6999 });
    expect(callDialogsBinding("jup_a10_actor_has_money")).toBe(false);

    mockActorWith([], { money: 7000 });
    expect(callDialogsBinding("jup_a10_actor_has_money")).toBe(true);
  });

  it("should require only 5000 money without the debt percent", () => {
    mockActorWith([], { money: 4999 });
    giveInfoPortion(infoPortions.jup_a10_debt_wo_percent);
    expect(callDialogsBinding("jup_a10_actor_has_money")).toBe(false);

    mockActorWith([], { money: 5000 });
    giveInfoPortion(infoPortions.jup_a10_debt_wo_percent);
    expect(callDialogsBinding("jup_a10_actor_has_money")).toBe(true);
  });
});

describe("jup_a10_actor_has_not_money", () => {
  it("should invert the debt affordability check", () => {
    mockActorWith([], { money: 6999 });
    expect(callDialogsBinding("jup_a10_actor_has_not_money", [registry.actor, MockGameObject.mock()])).toBe(true);

    mockActorWith([], { money: 7000 });
    expect(callDialogsBinding("jup_a10_actor_has_not_money", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("jup_a10_actor_give_money", () => {
  it("should take the full debt and record the bandit taking everything", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([], { money: 7000 });
    callDialogsBinding("jup_a10_actor_give_money", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 7000);
    expect(registry.actor.has_info(infoPortions.jup_a10_bandit_take_all_money)).toBe(true);
  });

  it("should take the reduced debt and record the plain bandit payment", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([], { money: 5000 });
    giveInfoPortion(infoPortions.jup_a10_debt_wo_percent);
    callDialogsBinding("jup_a10_actor_give_money", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 5000);
    expect(registry.actor.has_info(infoPortions.jup_a10_bandit_take_money)).toBe(true);
  });
});

describe("jup_a10_vano_give_money", () => {
  it("should pay Vano his share", () => {
    checkMoneyReward("jup_a10_vano_give_money", 5000);
  });
});

describe("jup_a10_actor_give_outfit_money", () => {
  it("should take the outfit fee", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("jup_a10_actor_give_outfit_money", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 5000);
  });
});

describe("jup_a10_actor_has_outfit_money", () => {
  it("should check the outfit fee threshold", () => {
    mockActorWith([], { money: 4999 });
    expect(callDialogsBinding("jup_a10_actor_has_outfit_money")).toBe(false);

    mockActorWith([], { money: 5000 });
    expect(callDialogsBinding("jup_a10_actor_has_outfit_money")).toBe(true);
  });
});

describe("jup_a10_actor_has_not_outfit_money", () => {
  it("should invert the outfit fee threshold", () => {
    mockActorWith([], { money: 4999 });
    expect(callDialogsBinding("jup_a10_actor_has_not_outfit_money", [registry.actor, MockGameObject.mock()])).toBe(
      true
    );

    mockActorWith([], { money: 5000 });
    expect(callDialogsBinding("jup_a10_actor_has_not_outfit_money", [registry.actor, MockGameObject.mock()])).toBe(
      false
    );
  });
});
