import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
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
  require("@/engine/declarations/dialogs/jupiter/jup_a9/mail");
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

describe("jupiter_a9_actor_has_all_mail_items", () => {
  it("should require every mail document", () => {
    expect(callDialogsBinding("jupiter_a9_actor_has_all_mail_items")).toBe(false);

    mockActorWith([questItems.jup_a9_conservation_info, questItems.jup_a9_power_info]);
    expect(callDialogsBinding("jupiter_a9_actor_has_all_mail_items")).toBe(false);

    mockActorWith([questItems.jup_a9_conservation_info, questItems.jup_a9_power_info, questItems.jup_a9_way_info]);
    expect(callDialogsBinding("jupiter_a9_actor_has_all_mail_items")).toBe(true);
  });
});

describe("jupiter_a9_actor_hasnt_all_mail_items", () => {
  it("should invert the complete mail-items predicate", () => {
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_all_mail_items")).toBe(true);

    mockActorWith([questItems.jup_a9_conservation_info, questItems.jup_a9_power_info, questItems.jup_a9_way_info]);
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_all_mail_items")).toBe(false);
  });
});

describe("jupiter_a9_actor_has_any_mail_items", () => {
  it("should accept any individual mail document and reject secondary ones", () => {
    expect(callDialogsBinding("jupiter_a9_actor_has_any_mail_items")).toBe(false);

    for (const item of [
      questItems.jup_a9_conservation_info,
      questItems.jup_a9_power_info,
      questItems.jup_a9_way_info,
    ]) {
      mockActorWith([item]);
      expect(callDialogsBinding("jupiter_a9_actor_has_any_mail_items")).toBe(true);
    }

    mockActorWith([questItems.jup_a9_delivery_info]);
    expect(callDialogsBinding("jupiter_a9_actor_has_any_mail_items")).toBe(false);
  });
});

describe("jupiter_a9_actor_hasnt_any_mail_items", () => {
  it("should report a partial mail set as incomplete", () => {
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_any_mail_items")).toBe(true);

    mockActorWith([questItems.jup_a9_conservation_info]);
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_any_mail_items")).toBe(true);

    mockActorWith([questItems.jup_a9_conservation_info, questItems.jup_a9_power_info, questItems.jup_a9_way_info]);
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_any_mail_items")).toBe(false);
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info", () => {
  it("should sell the evacuation info and mark the sale", () => {
    mockActorWith([questItems.jup_a9_evacuation_info]);

    checkTransferFromActor("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info", questItems.jup_a9_evacuation_info);
    expect(giveMoneyToActor).toHaveBeenCalledWith(750);
    expect(registry.actor.has_info(infoPortions.jup_a9_evacuation_info_sold)).toBe(true);
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info", () => {
  it("should sell the meeting info and mark the sale", () => {
    mockActorWith([questItems.jup_a9_meeting_info]);

    checkTransferFromActor("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info", questItems.jup_a9_meeting_info);
    expect(giveMoneyToActor).toHaveBeenCalledWith(750);
    expect(registry.actor.has_info(infoPortions.jup_a9_meeting_info_sold)).toBe(true);
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info", () => {
  it("should sell the losses info and mark the sale", () => {
    mockActorWith([questItems.jup_a9_losses_info]);

    checkTransferFromActor("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info", questItems.jup_a9_losses_info);
    expect(giveMoneyToActor).toHaveBeenCalledWith(750);
    expect(registry.actor.has_info(infoPortions.jup_a9_losses_info_sold)).toBe(true);
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info", () => {
  it("should sell the delivery info and mark the sale", () => {
    mockActorWith([questItems.jup_a9_delivery_info]);

    checkTransferFromActor("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info", questItems.jup_a9_delivery_info);
    expect(giveMoneyToActor).toHaveBeenCalledWith(750);
    expect(registry.actor.has_info(infoPortions.jup_a9_delivery_info_sold)).toBe(true);
  });
});
