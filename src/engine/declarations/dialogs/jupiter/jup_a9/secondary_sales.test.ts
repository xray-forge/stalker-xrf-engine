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
  require("@/engine/declarations/dialogs/jupiter/jup_a9/secondary_sales");
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

describe("jupiter_a9_actor_has_any_secondary_items", () => {
  it("should accept any secondary document and reject mail-only inventory", () => {
    expect(callDialogsBinding("jupiter_a9_actor_has_any_secondary_items")).toBe(false);

    for (const item of [
      questItems.jup_a9_delivery_info,
      questItems.jup_a9_evacuation_info,
      questItems.jup_a9_losses_info,
      questItems.jup_a9_meeting_info,
    ]) {
      mockActorWith([item]);
      expect(callDialogsBinding("jupiter_a9_actor_has_any_secondary_items")).toBe(true);
    }

    mockActorWith([questItems.jup_a9_way_info]);
    expect(callDialogsBinding("jupiter_a9_actor_has_any_secondary_items")).toBe(false);
  });
});

describe("jupiter_a9_freedom_leader_jupiter_delivery", () => {
  it("should pay for delivery info", () => {
    checkMoneyReward("jupiter_a9_freedom_leader_jupiter_delivery", 500);
  });
});

describe("jupiter_a9_freedom_leader_jupiter_evacuation", () => {
  it("should pay for evacuation info", () => {
    checkMoneyReward("jupiter_a9_freedom_leader_jupiter_evacuation", 500);
  });
});

describe("jupiter_a9_freedom_leader_jupiter_losses", () => {
  it("should pay for losses info", () => {
    checkMoneyReward("jupiter_a9_freedom_leader_jupiter_losses", 500);
  });
});

describe("jupiter_a9_freedom_leader_jupiter_meeting", () => {
  it("should pay for meeting info", () => {
    checkMoneyReward("jupiter_a9_freedom_leader_jupiter_meeting", 500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_delivery", () => {
  it("should pay for delivery info", () => {
    checkMoneyReward("jupiter_a9_dolg_leader_jupiter_delivery", 500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_evacuation", () => {
  it("should pay for evacuation info", () => {
    checkMoneyReward("jupiter_a9_dolg_leader_jupiter_evacuation", 500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_losses", () => {
  it("should pay for losses info", () => {
    checkMoneyReward("jupiter_a9_dolg_leader_jupiter_losses", 500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_meeting", () => {
  it("should pay for meeting info", () => {
    checkMoneyReward("jupiter_a9_dolg_leader_jupiter_meeting", 500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items", () => {
  it("should hand over and pay for every secondary document the actor carries", () => {
    const npc: GameObject = MockGameObject.mock();
    const secondaryItems: Array<TSection> = [
      questItems.jup_a9_evacuation_info,
      questItems.jup_a9_meeting_info,
      questItems.jup_a9_losses_info,
      questItems.jup_a9_delivery_info,
    ];

    mockActorWith(secondaryItems);

    callDialogsBinding("jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(4);
    expect(giveMoneyToActor).toHaveBeenCalledTimes(4);

    for (const item of secondaryItems) {
      expect(transferItemsFromActor).toHaveBeenCalledWith(npc, item);
    }
  });

  it("should do nothing when the actor carries no secondary document", () => {
    callDialogsBinding("jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items", [
      registry.actor,
      MockGameObject.mock(),
    ]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
    expect(giveMoneyToActor).not.toHaveBeenCalled();
  });
});

describe("jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items", () => {
  it("should hand over and pay for every secondary document the actor carries", () => {
    const npc: GameObject = MockGameObject.mock();
    const secondaryItems: Array<TSection> = [
      questItems.jup_a9_evacuation_info,
      questItems.jup_a9_meeting_info,
      questItems.jup_a9_losses_info,
      questItems.jup_a9_delivery_info,
    ];

    mockActorWith(secondaryItems);

    callDialogsBinding("jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(4);
    expect(giveMoneyToActor).toHaveBeenCalledTimes(4);

    for (const item of secondaryItems) {
      expect(transferItemsFromActor).toHaveBeenCalledWith(npc, item);
    }
  });

  it("should only process the documents actually carried", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([questItems.jup_a9_losses_info]);

    callDialogsBinding("jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_a9_losses_info);
    expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  });
});

describe("jup_a9_actor_has_meeting_info", () => {
  it("should check the meeting document", () => {
    checkHasItemPredicate("jup_a9_actor_has_meeting_info", questItems.jup_a9_meeting_info);
  });
});

describe("jup_a9_actor_hasnt_meeting_info", () => {
  it("should invert the meeting document check", () => {
    checkHasItemPredicate("jup_a9_actor_hasnt_meeting_info", questItems.jup_a9_meeting_info, false);
  });
});

describe("actor_relocate_meeting_info", () => {
  it("should transfer the meeting document to the NPC", () => {
    checkTransferFromActor("actor_relocate_meeting_info", questItems.jup_a9_meeting_info);
  });
});

describe("jup_a9_actor_has_delivery_info", () => {
  it("should check the delivery document", () => {
    checkHasItemPredicate("jup_a9_actor_has_delivery_info", questItems.jup_a9_delivery_info);
  });
});

describe("jup_a9_actor_hasnt_delivery_info", () => {
  it("should invert the delivery document check", () => {
    checkHasItemPredicate("jup_a9_actor_hasnt_delivery_info", questItems.jup_a9_delivery_info, false);
  });
});

describe("jup_a9_actor_has_evacuation_info", () => {
  it("should check the evacuation document", () => {
    checkHasItemPredicate("jup_a9_actor_has_evacuation_info", questItems.jup_a9_evacuation_info);
  });
});

describe("jup_a9_actor_hasnt_evacuation_info", () => {
  it("should invert the evacuation document check", () => {
    checkHasItemPredicate("jup_a9_actor_hasnt_evacuation_info", questItems.jup_a9_evacuation_info, false);
  });
});

describe("actor_relocate_evacuation_info", () => {
  it("should transfer the evacuation document to the NPC", () => {
    checkTransferFromActor("actor_relocate_evacuation_info", questItems.jup_a9_evacuation_info);
  });
});

describe("actor_relocate_delivery_info", () => {
  it("should transfer the delivery document to the NPC", () => {
    checkTransferFromActor("actor_relocate_delivery_info", questItems.jup_a9_delivery_info);
  });
});

describe("jup_a9_actor_has_losses_info", () => {
  it("should check the losses document", () => {
    checkHasItemPredicate("jup_a9_actor_has_losses_info", questItems.jup_a9_losses_info);
  });
});

describe("jup_a9_actor_hasnt_losses_info", () => {
  it("should invert the losses document check", () => {
    checkHasItemPredicate("jup_a9_actor_hasnt_losses_info", questItems.jup_a9_losses_info, false);
  });
});

describe("actor_relocate_losses_info", () => {
  it("should transfer the losses document to the NPC", () => {
    checkTransferFromActor("actor_relocate_losses_info", questItems.jup_a9_losses_info);
  });
});
