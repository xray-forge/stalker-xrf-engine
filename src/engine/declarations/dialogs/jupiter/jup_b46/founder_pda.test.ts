import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
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
  require("@/engine/declarations/dialogs/jupiter/jup_b46/founder_pda");
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

describe("jup_b46_sell_duty_founder_pda", () => {
  it("should reward the Freedom variant when the PDA went to Freedom", () => {
    giveInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_freedom);

    callDialogsBinding("jup_b46_sell_duty_founder_pda");

    expect(giveMoneyToActor).toHaveBeenCalledWith(4000);
    expect(giveItemsToActor).toHaveBeenCalledWith(weapons.wpn_sig550, 1);
    expect(giveItemsToActor).toHaveBeenCalledWith(ammo["ammo_5.56x45_ss190"], 150);
  });

  it("should reward the Duty variant when the PDA went to Duty", () => {
    giveInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_duty);

    callDialogsBinding("jup_b46_sell_duty_founder_pda");

    expect(giveMoneyToActor).toHaveBeenCalledWith(4000);
    expect(giveItemsToActor).toHaveBeenCalledWith(weapons.wpn_groza, 1);
    expect(giveItemsToActor).toHaveBeenCalledWith(ammo.ammo_9x39_ap, 60);
    expect(giveItemsToActor).toHaveBeenCalledWith(ammo["ammo_vog-25"], 2);
  });

  it("should reward nothing when no faction was chosen", () => {
    callDialogsBinding("jup_b46_sell_duty_founder_pda");

    expect(giveMoneyToActor).not.toHaveBeenCalled();
    expect(giveItemsToActor).not.toHaveBeenCalled();
  });
});

describe("jup_b46_transfer_duty_founder_pda", () => {
  it("should transfer the founder PDA only when the actor carries it", () => {
    callDialogsBinding("jup_b46_transfer_duty_founder_pda", [registry.actor, MockGameObject.mock()]);
    expect(transferItemsFromActor).not.toHaveBeenCalled();

    mockActorWith([questItems.jup_b46_duty_founder_pda]);
    checkTransferFromActor("jup_b46_transfer_duty_founder_pda", questItems.jup_b46_duty_founder_pda);
  });
});

describe("jup_b46_sell_duty_founder_pda_to_owl", () => {
  it("should take the PDA, pay for it, and record both sale info portions", () => {
    mockActorWith([questItems.jup_b46_duty_founder_pda]);

    checkTransferFromActor("jup_b46_sell_duty_founder_pda_to_owl", questItems.jup_b46_duty_founder_pda);

    expect(giveMoneyToActor).toHaveBeenCalledWith(2500);
    expect(registry.actor.has_info(infoPortions.jup_b46_duty_founder_pda_sold)).toBe(true);
    expect(registry.actor.has_info(infoPortions.jup_b46_duty_founder_pda_to_stalkers)).toBe(true);
  });
});

describe("jup_b46_actor_has_founder_pda", () => {
  it("should check the founder PDA", () => {
    checkHasItemPredicate("jup_b46_actor_has_founder_pda", questItems.jup_b46_duty_founder_pda);
  });
});
