import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { drugs } from "@/engine/constants/items/drugs";
import { helmets } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
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
  require("@/engine/declarations/dialogs/jupiter/jup_b1/artifact");
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

describe("if_actor_has_jup_b1_art", () => {
  it("should check the b1 half artefact", () => {
    checkHasItemPredicate("if_actor_has_jup_b1_art", "jup_b1_half_artifact");
  });
});

describe("give_jup_b1_art", () => {
  it("should take the b1 half artefact", () => {
    mockActorWith(["jup_b1_half_artifact"]);

    checkTransferFromActor("give_jup_b1_art", "jup_b1_half_artifact");
  });
});

describe("jup_b1_actor_have_good_suit", () => {
  it("should accept an accepted outfit in the body slot", () => {
    expect(callDialogsBinding("jup_b1_actor_have_good_suit")).toBe(false);

    const outfit: GameObject = MockGameObject.mock({ section: outfits.exo_outfit });

    mockItemInSlot(7, outfit);

    expect(callDialogsBinding("jup_b1_actor_have_good_suit")).toBe(true);
  });

  it("should accept an accepted helmet in the head slot", () => {
    const helmet: GameObject = MockGameObject.mock({ section: helmets.helm_battle });

    mockItemInSlot(12, helmet);

    expect(callDialogsBinding("jup_b1_actor_have_good_suit")).toBe(true);
  });

  it("should reject gear that is not on either accepted list", () => {
    const outfit: GameObject = MockGameObject.mock({ section: outfits.stalker_outfit });

    MockGameObject.asMock(registry.actor).item_in_slot.mockReturnValue(outfit as never);

    expect(callDialogsBinding("jup_b1_actor_have_good_suit")).toBe(false);
  });
});

describe("jup_b1_actor_do_not_have_good_suit", () => {
  it("should invert the good gear check", () => {
    expect(callDialogsBinding("jup_b1_actor_do_not_have_good_suit", [registry.actor, MockGameObject.mock()])).toBe(
      true
    );

    const outfit: GameObject = MockGameObject.mock({ section: outfits.exo_outfit });

    mockItemInSlot(7, outfit);

    expect(callDialogsBinding("jup_b1_actor_do_not_have_good_suit", [registry.actor, MockGameObject.mock()])).toBe(
      false
    );
  });
});

describe("jup_b1_reward_actor", () => {
  it("should pay the b1 reward", () => {
    checkMoneyReward("jup_b1_reward_actor", 6000);
  });
});

describe("jup_b1_stalker_squad_thanks", () => {
  it("should hand over the full medicine package and a protective helmet", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("jup_b1_stalker_squad_thanks", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(7);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 5);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.drug_psy_blockade, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.drug_antidot, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.drug_radioprotector, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.drug_anabiotic);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, helmets.helm_protective);
  });
});
