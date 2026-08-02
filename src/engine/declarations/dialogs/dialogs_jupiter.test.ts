import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject, ServerHumanObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { artefacts } from "@/engine/constants/items/artefacts";
import { detectors } from "@/engine/constants/items/detectors";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { helmets } from "@/engine/constants/items/helmets";
import { misc } from "@/engine/constants/items/misc";
import { outfits } from "@/engine/constants/items/outfits";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { getManager, registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { getObjectsRelationSafe, isActorEnemyWithFaction } from "@/engine/core/utils/relation";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, MockSquad, resetRegistry } from "@/fixtures/engine";

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
jest.mock("@/engine/core/utils/relation");
jest.mock("@/engine/core/utils/position");

beforeAll(() => {
  require("@/engine/declarations/effects/game/inc_counter");
  require("@/engine/declarations/effects/game/dec_counter");
  require("@/engine/declarations/dialogs/dialogs_jupiter");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(getObjectsRelationSafe);
  resetFunctionMock(isActorEnemyWithFaction);
  resetFunctionMock(isObjectInSmartTerrain);
  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("jup_b208_give_reward", () => {
  it("should grant money and all three treasure coordinates", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callDialogsBinding("jup_b208_give_reward");

    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_18");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_35");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_45");
  });
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

describe("jupiter_a9_actor_hasnt_any_mail_items", () => {
  it("should report a partial mail set as incomplete", () => {
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_any_mail_items")).toBe(true);

    mockActorWith([questItems.jup_a9_conservation_info]);
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_any_mail_items")).toBe(true);

    mockActorWith([questItems.jup_a9_conservation_info, questItems.jup_a9_power_info, questItems.jup_a9_way_info]);
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_any_mail_items")).toBe(false);
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

describe("actor_relocate_trapper_reward", () => {
  it("should transfer the trapper rifle to the actor", () => {
    checkTransferToActor("actor_relocate_trapper_reward", weapons.wpn_wincheaster1300_trapper);
  });
});

describe("zat_b106_trapper_reward", () => {
  it("should increase the trapper payment for a one-hit chimera kill", () => {
    callDialogsBinding("zat_b106_trapper_reward");
    expect(giveMoneyToActor).toHaveBeenLastCalledWith(2000);

    giveInfoPortion(infoPortions.zat_b106_one_hit);

    callDialogsBinding("zat_b106_trapper_reward");
    expect(giveMoneyToActor).toHaveBeenLastCalledWith(3000);
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

describe("if_actor_has_jup_b16_oasis_artifact", () => {
  it("should check the oasis heart artefact", () => {
    checkHasItemPredicate("if_actor_has_jup_b16_oasis_artifact", artefacts.af_oasis_heart);
  });
});

describe("if_actor_hasnt_jup_b16_oasis_artifact", () => {
  it("should invert the oasis heart artefact check", () => {
    checkHasItemPredicate("if_actor_hasnt_jup_b16_oasis_artifact", artefacts.af_oasis_heart, false);
  });
});

describe("jupiter_b16_reward", () => {
  it("should pay the oasis reward", () => {
    checkMoneyReward("jupiter_b16_reward", 7000);
  });
});

describe("give_jup_b16_oasis_artifact", () => {
  it("should transfer the oasis heart to the NPC", () => {
    checkTransferFromActor("give_jup_b16_oasis_artifact", artefacts.af_oasis_heart);
  });
});

describe("jup_a12_actor_has_15000_money", () => {
  it("should check the ransom money threshold", () => {
    mockActorWith([], { money: 14999 });
    expect(callDialogsBinding("jup_a12_actor_has_15000_money")).toBe(false);

    mockActorWith([], { money: 15000 });
    expect(callDialogsBinding("jup_a12_actor_has_15000_money")).toBe(true);
  });
});

describe("jup_a12_actor_do_not_has_15000_money", () => {
  it("should invert the ransom money threshold", () => {
    mockActorWith([], { money: 14999 });
    expect(callDialogsBinding("jup_a12_actor_do_not_has_15000_money")).toBe(true);

    mockActorWith([], { money: 15000 });
    expect(callDialogsBinding("jup_a12_actor_do_not_has_15000_money")).toBe(false);
  });
});

describe("jup_a12_actor_has_artefacts", () => {
  it("should accept any of the four ransom artefacts", () => {
    expect(callDialogsBinding("jup_a12_actor_has_artefacts")).toBe(false);

    for (const artefact of [artefacts.af_fire, artefacts.af_gold_fish, artefacts.af_glass, artefacts.af_ice]) {
      mockActorWith([artefact]);
      expect(callDialogsBinding("jup_a12_actor_has_artefacts")).toBe(true);
    }
  });
});

describe("jup_a12_actor_has_artefact_1", () => {
  it("should accept only the fire artefact", () => {
    checkHasItemPredicate("jup_a12_actor_has_artefact_1", artefacts.af_fire);

    mockActorWith([artefacts.af_ice]);
    expect(callDialogsBinding("jup_a12_actor_has_artefact_1")).toBe(false);
  });
});

describe("jup_a12_actor_has_artefact_2", () => {
  it("should accept only the gold fish artefact", () => {
    checkHasItemPredicate("jup_a12_actor_has_artefact_2", artefacts.af_gold_fish);

    mockActorWith([artefacts.af_fire]);
    expect(callDialogsBinding("jup_a12_actor_has_artefact_2")).toBe(false);
  });
});

describe("jup_a12_actor_has_artefact_3", () => {
  it("should accept only the glass artefact", () => {
    checkHasItemPredicate("jup_a12_actor_has_artefact_3", artefacts.af_glass);

    mockActorWith([artefacts.af_fire]);
    expect(callDialogsBinding("jup_a12_actor_has_artefact_3")).toBe(false);
  });
});

describe("jup_a12_actor_has_artefact_4", () => {
  it("should accept only the ice artefact", () => {
    checkHasItemPredicate("jup_a12_actor_has_artefact_4", artefacts.af_ice);

    mockActorWith([artefacts.af_fire]);
    expect(callDialogsBinding("jup_a12_actor_has_artefact_4")).toBe(false);
  });
});

describe("jup_a12_actor_do_not_has_artefacts", () => {
  it("should invert the ransom artefact check", () => {
    expect(callDialogsBinding("jup_a12_actor_do_not_has_artefacts")).toBe(true);

    for (const artefact of [artefacts.af_fire, artefacts.af_gold_fish, artefacts.af_glass, artefacts.af_ice]) {
      mockActorWith([artefact]);
      expect(callDialogsBinding("jup_a12_actor_do_not_has_artefacts")).toBe(false);
    }
  });
});

describe("jup_a12_transfer_ransom_from_actor", () => {
  it("should take the money ransom when that option was chosen", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([], { money: 15000 });
    giveInfoPortion(infoPortions.jup_a12_ransom_by_money);

    callDialogsBinding("jup_a12_transfer_ransom_from_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 15000);
    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });

  it("should take the artefact matching the chosen ransom info portion", () => {
    const ransoms: Array<[TName, TSection]> = [
      ["jup_a12_af_fire", artefacts.af_fire],
      ["jup_a12_af_gold_fish", artefacts.af_gold_fish],
      ["jup_a12_af_glass", artefacts.af_glass],
      ["jup_a12_af_ice", artefacts.af_ice],
    ];

    for (const [portion, artefact] of ransoms) {
      const npc: GameObject = MockGameObject.mock();

      mockActorWith([artefact]);
      resetFunctionMock(transferItemsFromActor);
      giveInfoPortion(portion);

      callDialogsBinding("jup_a12_transfer_ransom_from_actor", [registry.actor, npc]);

      expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefact);
    }
  });

  it("should take nothing when no ransom option was chosen", () => {
    callDialogsBinding("jup_a12_transfer_ransom_from_actor", [registry.actor, MockGameObject.mock()]);

    expect(transferMoneyFromActor).not.toHaveBeenCalled();
    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});

describe("jup_a12_transfer_5000_money_to_actor", () => {
  it("should pay money and reveal both treasures", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callDialogsBinding("jup_a12_transfer_5000_money_to_actor");

    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_40");
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_34");

    coordinates.mockRestore();
  });
});

describe("jup_a12_transfer_artefact_to_actor", () => {
  it("should give the gold fish without treasures by default", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    checkTransferToActor("jup_a12_transfer_artefact_to_actor", artefacts.af_gold_fish);

    expect(coordinates).not.toHaveBeenCalled();

    coordinates.mockRestore();
  });

  it("should also reveal both treasures once the prisoner was freed", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    giveInfoPortion(infoPortions.jup_a12_stalker_prisoner_free_dialog_done);

    callDialogsBinding("jup_a12_transfer_artefact_to_actor", [registry.actor, MockGameObject.mock()]);

    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_40");
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_34");

    coordinates.mockRestore();
  });
});

describe("jup_a12_transfer_cashier_money_from_actor", () => {
  it("should take the randomly rolled amount when the actor can afford it", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 30);
    mockActorWith([], { money: 10000 });

    callDialogsBinding("jup_a12_transfer_cashier_money_from_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 3000);
  });

  it("should cap the amount at what the actor actually owns", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 50);
    mockActorWith([], { money: 1200 });

    callDialogsBinding("jup_a12_transfer_cashier_money_from_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 1200);
  });
});

describe("zat_b30_transfer_detectors", () => {
  it("should transfer three elite detectors to the NPC", () => {
    checkTransferFromActor("zat_b30_transfer_detectors", detectors.detector_elite, 3);
  });
});

describe("zat_b30_actor_has_transfer_items", () => {
  it("should require at least three elite detectors in the inventory", () => {
    expect(callDialogsBinding("zat_b30_actor_has_transfer_items")).toBe(false);

    mockActorWith([detectors.detector_elite, detectors.detector_elite]);
    expect(callDialogsBinding("zat_b30_actor_has_transfer_items")).toBe(false);

    mockActorWith([detectors.detector_elite, detectors.detector_elite, detectors.detector_elite]);
    expect(callDialogsBinding("zat_b30_actor_has_transfer_items")).toBe(true);
  });
});

describe("zat_b30_actor_do_not_has_transfer_items", () => {
  it("should invert the elite detector count check", () => {
    expect(callDialogsBinding("zat_b30_actor_do_not_has_transfer_items", [registry.actor, MockGameObject.mock()])).toBe(
      true
    );

    mockActorWith([detectors.detector_elite, detectors.detector_elite, detectors.detector_elite]);
    expect(callDialogsBinding("zat_b30_actor_do_not_has_transfer_items", [registry.actor, MockGameObject.mock()])).toBe(
      false
    );
  });
});

describe("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond", () => {
  it("should require the b32 quest to be active", () => {
    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(false);

    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);
    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(true);
  });

  it("should close once the addon started after the task was given or failed", () => {
    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);
    giveInfoPortion(infoPortions.jup_b6_give_task);
    giveInfoPortion(infoPortions.jup_b32_task_addon_start);
    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(false);

    mockActorWith([]);
    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);
    giveInfoPortion(infoPortions.jup_b6_task_fail);
    giveInfoPortion(infoPortions.jup_b32_task_addon_start);
    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(false);
  });

  it("should stay open while the addon has not started", () => {
    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);
    giveInfoPortion(infoPortions.jup_b6_give_task);

    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(true);
  });
});

describe("jup_b32_task_give_dialog_precond", () => {
  it("should block the offer only while the task is started and not ended", () => {
    expect(callDialogsBinding("jup_b32_task_give_dialog_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b32_task_start);
    expect(callDialogsBinding("jup_b32_task_give_dialog_precond")).toBe(false);

    giveInfoPortion("jup_b32_task_end");
    expect(callDialogsBinding("jup_b32_task_give_dialog_precond")).toBe(true);
  });
});

describe("jup_b32_transfer_scanners", () => {
  it("should give three scanner devices", () => {
    checkTransferToActor("jup_b32_transfer_scanners", infoPortions.jup_b32_scanner_device, 3);
  });
});

describe("jup_b32_transfer_scanners_2", () => {
  it("should give two scanner devices", () => {
    checkTransferToActor("jup_b32_transfer_scanners_2", infoPortions.jup_b32_scanner_device, 2);
  });
});

describe("jup_b32_give_reward_to_actor", () => {
  it("should pay the b32 reward", () => {
    checkMoneyReward("jup_b32_give_reward_to_actor", 5000);
  });
});

describe("jup_b209_get_monster_scanner", () => {
  it("should give the monster scanner to the actor", () => {
    checkTransferToActor("jup_b209_get_monster_scanner", "jup_b209_monster_scanner", 1);
  });
});

describe("jup_b209_return_monster_scanner", () => {
  it("should take the monster scanner back from the actor", () => {
    checkTransferFromActor("jup_b209_return_monster_scanner", "jup_b209_monster_scanner", 1);
  });
});

describe("jup_b32_anomaly_do_not_has_af", () => {
  it("should consume the stale anomaly marker and report the artefact as present", () => {
    expect(callDialogsBinding("jup_b32_anomaly_do_not_has_af")).toBe(true);

    giveInfoPortion(infoPortions.jup_b32_anomaly_true);

    expect(callDialogsBinding("jup_b32_anomaly_do_not_has_af")).toBe(false);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_true)).toBe(false);
  });
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

describe("jup_b6_actor_outfit_cs", () => {
  it("should detect the clear sky heavy outfit in the body slot", () => {
    expect(callDialogsBinding("jup_b6_actor_outfit_cs")).toBe(false);

    const outfit: GameObject = MockGameObject.mock({ section: outfits.cs_heavy_outfit });

    MockGameObject.asMock(registry.actor).item_in_slot.mockReturnValue(outfit as never);

    expect(callDialogsBinding("jup_b6_actor_outfit_cs")).toBe(true);
  });
});

describe("jup_b6_first_reward_for_actor", () => {
  it("should pay the first b6 reward", () => {
    checkMoneyReward("jup_b6_first_reward_for_actor", 2500);
  });
});

describe("jup_b6_second_reward_for_actor", () => {
  it("should pay the second b6 reward", () => {
    checkMoneyReward("jup_b6_second_reward_for_actor", 2500);
  });
});

describe("jup_b6_all_reward_for_actor", () => {
  it("should pay the combined b6 reward", () => {
    checkMoneyReward("jup_b6_all_reward_for_actor", 5000);
  });
});

describe("jup_b6_first_reward_for_actor_extra", () => {
  it("should pay the extra first b6 reward", () => {
    checkMoneyReward("jup_b6_first_reward_for_actor_extra", 3500);
  });
});

describe("jup_b6_second_reward_for_actor_extra", () => {
  it("should pay the extra second b6 reward", () => {
    checkMoneyReward("jup_b6_second_reward_for_actor_extra", 3500);
  });
});

describe("jup_b6_all_reward_for_actor_extra", () => {
  it("should pay the combined extra b6 reward", () => {
    checkMoneyReward("jup_b6_all_reward_for_actor_extra", 7000);
  });
});

describe("jup_b6_reward_actor_by_detector", () => {
  it("should give the elite detector", () => {
    checkTransferToActor("jup_b6_reward_actor_by_detector", detectors.detector_elite);
  });
});

describe("jup_b6_actor_can_start", () => {
  it("should allow the start until the b1 squad died with nobody employed", () => {
    expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(true);

    giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
    expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(false);
  });

  it("should allow the start again once any squad is employed", () => {
    for (const portion of [
      infoPortions.jup_b6_freedom_employed,
      infoPortions.jup_b6_duty_employed,
      infoPortions.jup_b6_gonta_employed,
      infoPortions.jup_b6_exprisoner_work_on_sci,
    ]) {
      mockActorWith([]);

      giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
      giveInfoPortion(portion);

      expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(true);
    }
  });
});

describe("jup_b6_actor_can_not_start", () => {
  it("should invert the b6 start check", () => {
    expect(callDialogsBinding("jup_b6_actor_can_not_start", [registry.actor, MockGameObject.mock()])).toBe(false);

    giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
    expect(callDialogsBinding("jup_b6_actor_can_not_start", [registry.actor, MockGameObject.mock()])).toBe(true);
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

describe("jup_b202_actor_has_medkit", () => {
  it("should accept any medkit variant", () => {
    expect(callDialogsBinding("jup_b202_actor_has_medkit")).toBe(false);

    for (const medkit of [drugs.medkit, drugs.medkit_army, drugs.medkit_scientic]) {
      mockActorWith([medkit]);
      expect(callDialogsBinding("jup_b202_actor_has_medkit")).toBe(true);
    }
  });
});

describe("jup_b202_hit_bandit_from_actor", () => {
  it("should record both hit info portions and turn the bandit squad hostile", () => {
    const npc: GameObject = MockGameObject.mock();
    const setSquadGoodwill = jest.fn();

    (_G as AnyObject)["xr_effects"].set_squad_goodwill = setSquadGoodwill;

    callDialogsBinding("jup_b202_hit_bandit_from_actor", [registry.actor, npc]);

    expect(registry.actor.has_info(infoPortions.jup_b202_bandit_hited)).toBe(true);
    expect(registry.actor.has_info(infoPortions.jup_b202_bandit_hited_by_actor)).toBe(true);
    expect(setSquadGoodwill).toHaveBeenCalledWith(registry.actor, npc, ["jup_b202_bandit_squad", "enemy"]);
  });
});

describe("jup_b202_medic_dialog_precondition", () => {
  it("should switch to the polustanok check once the squad is gathered", () => {
    giveInfoPortion(infoPortions.jup_b218_gather_squad_complete);
    expect(callDialogsBinding("jup_b202_medic_dialog_precondition")).toBe(true);

    giveInfoPortion(infoPortions.jup_b202_polustanok);
    expect(callDialogsBinding("jup_b202_medic_dialog_precondition")).toBe(false);
  });

  it("should use the medic testimony check before the squad is gathered", () => {
    expect(callDialogsBinding("jup_b202_medic_dialog_precondition")).toBe(true);

    giveInfoPortion(infoPortions.jup_b52_medic_testimony);
    expect(callDialogsBinding("jup_b202_medic_dialog_precondition")).toBe(false);
  });
});

describe("jup_b202_transfer_medkit", () => {
  it("should prefer the plain medkit when several kinds are carried", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([drugs.medkit, drugs.medkit_army, drugs.medkit_scientic]);
    callDialogsBinding("jup_b202_transfer_medkit", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, drugs.medkit);
  });

  it("should fall back to the army and scientific medkits in order", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([drugs.medkit_army, drugs.medkit_scientic]);
    callDialogsBinding("jup_b202_transfer_medkit", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenLastCalledWith(npc, drugs.medkit_army);

    mockActorWith([drugs.medkit_scientic]);
    callDialogsBinding("jup_b202_transfer_medkit", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenLastCalledWith(npc, drugs.medkit_scientic);
  });

  it("should transfer nothing when the actor has no medkit", () => {
    callDialogsBinding("jup_b202_transfer_medkit", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});

describe("jup_b6_stalker_dialog_precond", () => {
  /**
   * Build an NPC speaker that belongs to a squad with the provided section name.
   */
  function mockSquadMember(squadSection: TName): GameObject {
    const squad: MockSquad = MockSquad.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    // The squad section is spied rather than configured, since constructing a squad reads its ini section.
    jest.spyOn(squad, "section_name").mockImplementation(() => squadSection);

    serverObject.group_id = squad.id;

    return MockGameObject.mock({ id: serverObject.id });
  }

  beforeEach(() => {
    registry.simulator = MockAlifeSimulator.getInstance();
  });

  it("should reject a speaker that has no server object", () => {
    expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, MockGameObject.mock()])).toBe(false);
  });

  it("should accept the b1 stalker squad while it is alive", () => {
    const npc: GameObject = mockSquadMember(infoPortions.jup_b1_stalker_squad);

    expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(true);

    giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
    expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(false);
  });

  it("should accept each employed squad only once its employment info portion is set", () => {
    const squads: Array<[TName, TName]> = [
      [infoPortions.jup_b6_stalker_freedom_squad, infoPortions.jup_b6_freedom_employed],
      [infoPortions.jup_b6_stalker_duty_squad, infoPortions.jup_b6_duty_employed],
      [infoPortions.jup_b6_stalker_gonta_squad, infoPortions.jup_b6_gonta_employed],
      [infoPortions.jup_b6_stalker_exprisoner_squad, infoPortions.jup_b6_exprisoner_work_on_sci],
    ];

    for (const [squadSection, employedPortion] of squads) {
      mockActorWith([]);
      registry.simulator = MockAlifeSimulator.getInstance();

      const npc: GameObject = mockSquadMember(squadSection);

      expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(false);

      giveInfoPortion(employedPortion);
      expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(true);
    }
  });

  it("should reject a squad that is not part of the quest", () => {
    const npc: GameObject = mockSquadMember("some_other_squad");

    expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b217_actor_got_toolkit", () => {
  it("should detect a toolkit that has not been brought yet", () => {
    expect(callDialogsBinding("jup_b217_actor_got_toolkit")).toBe(false);

    mockActorWith([misc.toolkit_2]);
    expect(callDialogsBinding("jup_b217_actor_got_toolkit")).toBe(true);
    expect((registry.actor as AnyObject).toolkit).toBe(misc.toolkit_2);
  });

  it("should ignore a toolkit that was already brought", () => {
    mockActorWith([misc.toolkit_1]);
    giveInfoPortion(infoPortions.jup_b217_tech_instrument_1_brought);

    expect(callDialogsBinding("jup_b217_actor_got_toolkit")).toBe(false);
  });
});

describe("jupiter_b200_tech_materials_relocate", () => {
  it("should transfer every tech material and count them", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([
      questItems.jup_b200_tech_materials_wire,
      questItems.jup_b200_tech_materials_wire,
      questItems.jup_b200_tech_materials_acetone,
      "wpn_pm",
    ]);

    callDialogsBinding("jupiter_b200_tech_materials_relocate", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(2);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b200_tech_materials_wire, 2);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b200_tech_materials_acetone, 1);

    // The counter is incremented through `xr_effects.inc_counter` with a `tostring(count)` argument, mirroring the
    // original script. Lua coerces that back to a number, so the exact stored value is not asserted here.
    expect(getPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_brought_counter", 0)).not.toBe(0);
  });

  it("should transfer nothing when the actor carries no tech material", () => {
    callDialogsBinding("jupiter_b200_tech_materials_relocate", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});

describe("npc_in_b4_smart", () => {
  it("should check the jup_b4 terrain for the NPC speaker", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(isObjectInSmartTerrain).mockReturnValue(true);
    expect(callDialogsBinding("npc_in_b4_smart", [registry.actor, npc])).toBe(true);
    expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, "jup_b4");

    jest.mocked(isObjectInSmartTerrain).mockReturnValue(false);
    expect(callDialogsBinding("npc_in_b4_smart", [registry.actor, npc])).toBe(false);
  });
});

describe("jupiter_b220_all_hunted", () => {
  it("should report pending hunts until every one is told", () => {
    const portions = [
      infoPortions.jup_b220_trapper_bloodsucker_lair_hunted_told,
      infoPortions.jup_b220_trapper_zaton_chimera_hunted_told,
      infoPortions.jup_b211_swamp_bloodsuckers_hunt_done,
      infoPortions.jup_b208_burers_hunt_done,
      infoPortions.jup_b212_jupiter_chimera_hunt_done,
    ];

    for (const portion of portions) {
      expect(callDialogsBinding("jupiter_b220_all_hunted")).toBe(true);
      giveInfoPortion(portion);
    }

    expect(callDialogsBinding("jupiter_b220_all_hunted")).toBe(false);
  });
});

describe("jupiter_b220_no_one_hunted", () => {
  it("should report nothing to tell by default", () => {
    expect(callDialogsBinding("jupiter_b220_no_one_hunted")).toBe(true);
  });

  it("should report a pending report for every completed but untold hunt", () => {
    const pending: Array<Array<TName>> = [
      [
        infoPortions.jup_b220_trapper_about_himself_told,
        infoPortions.zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give,
      ],
      [infoPortions.zat_b106_chimera_dead],
      [infoPortions.jup_b6_all_hunters_are_dead],
      [infoPortions.jup_b208_burers_dead],
      [infoPortions.jup_b212_jupiter_chimera_dead],
    ];

    for (const portions of pending) {
      mockActorWith([]);

      for (const portion of portions) {
        giveInfoPortion(portion);
      }

      expect(callDialogsBinding("jupiter_b220_no_one_hunted")).toBe(false);
    }
  });
});

describe("jup_b9_actor_has_money", () => {
  it("should be satisfied for free while no materials counter is set", () => {
    mockActorWith([], { money: 0 });

    expect(callDialogsBinding("jup_b9_actor_has_money")).toBe(true);
  });

  it("should scale the required price down as more materials are brought", () => {
    const prices: Array<[TName, TCount]> = [
      ["jup_b200_tech_materials_brought_counter_1", 3000],
      ["jup_b200_tech_materials_brought_counter_5", 2400],
      ["jup_b200_tech_materials_brought_counter_9", 1800],
    ];

    for (const [portion, price] of prices) {
      mockActorWith([], { money: price - 1 });
      giveInfoPortion(portion);
      expect(callDialogsBinding("jup_b9_actor_has_money")).toBe(false);

      mockActorWith([], { money: price });
      giveInfoPortion(portion);
      expect(callDialogsBinding("jup_b9_actor_has_money")).toBe(true);
    }
  });
});

describe("jup_b9_actor_has_not_money", () => {
  it("should invert the blackbox affordability check", () => {
    mockActorWith([], { money: 2999 });
    giveInfoPortion("jup_b200_tech_materials_brought_counter_1");
    expect(callDialogsBinding("jup_b9_actor_has_not_money", [registry.actor, MockGameObject.mock()])).toBe(true);

    mockActorWith([], { money: 3000 });
    giveInfoPortion("jup_b200_tech_materials_brought_counter_1");
    expect(callDialogsBinding("jup_b9_actor_has_not_money", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("jupiter_b9_relocate_money", () => {
  it("should take the price matching the materials counter", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("jupiter_b9_relocate_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 0);

    giveInfoPortion("jup_b200_tech_materials_brought_counter_1");
    callDialogsBinding("jupiter_b9_relocate_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 3000);
  });
});

describe("give_jup_b9_blackbox", () => {
  it("should take the blackbox from the actor", () => {
    checkTransferFromActor("give_jup_b9_blackbox", questItems.jup_b9_blackbox);
  });
});

describe("if_actor_has_jup_b9_blackbox", () => {
  it("should check the blackbox", () => {
    checkHasItemPredicate("if_actor_has_jup_b9_blackbox", questItems.jup_b9_blackbox);
  });
});

describe("if_actor_has_af_mincer_meat", () => {
  it("should check the mincer meat artefact on the first speaker", () => {
    checkHasItemPredicate("if_actor_has_af_mincer_meat", artefacts.af_mincer_meat);
  });
});

describe("if_actor_has_af_fuzz_kolobok", () => {
  it("should check the fuzz kolobok artefact on the first speaker", () => {
    checkHasItemPredicate("if_actor_has_af_fuzz_kolobok", artefacts.af_fuzz_kolobok);
  });
});

describe("actor_has_first_or_second_artefact", () => {
  it("should accept either of the two b9 artefacts", () => {
    expect(callDialogsBinding("actor_has_first_or_second_artefact", [registry.actor, MockGameObject.mock()])).toBe(
      false
    );

    for (const artefact of [artefacts.af_mincer_meat, artefacts.af_fuzz_kolobok]) {
      mockActorWith([artefact]);
      expect(callDialogsBinding("actor_has_first_or_second_artefact", [registry.actor, MockGameObject.mock()])).toBe(
        true
      );
    }
  });
});

describe("transfer_af_mincer_meat", () => {
  it("should take the mincer meat artefact", () => {
    checkTransferFromActor("transfer_af_mincer_meat", artefacts.af_mincer_meat);
  });
});

describe("jup_b15_dec_counter", () => {
  it("should decrement the drunk counter through the shared effect", () => {
    setPortableStoreValue(ACTOR_ID, "jup_b15_full_drunk_count", 3);

    callDialogsBinding("jup_b15_dec_counter", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "jup_b15_full_drunk_count", 0)).toBe(2);
  });

  it("should not decrement the counter below zero", () => {
    callDialogsBinding("jup_b15_dec_counter", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "jup_b15_full_drunk_count", 0)).toBe(0);
  });
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

describe("jup_b47_jupiter_docs_enabled", () => {
  it("should enable the dialog while the actor carries any a9 document", () => {
    expect(callDialogsBinding("jup_b47_jupiter_docs_enabled")).toBe(false);

    mockActorWith([questItems.jup_a9_way_info]);
    expect(callDialogsBinding("jup_b47_jupiter_docs_enabled")).toBe(true);
  });

  it("should disable the dialog once the docs were already talked about", () => {
    mockActorWith([questItems.jup_a9_way_info]);
    giveInfoPortion(infoPortions.jup_b6_scientist_nuclear_physicist_jupiter_docs_talked);

    expect(callDialogsBinding("jup_b47_jupiter_docs_enabled")).toBe(false);
  });
});

describe("transfer_af_fuzz_kolobok", () => {
  it("should take the fuzz kolobok artefact", () => {
    checkTransferFromActor("transfer_af_fuzz_kolobok", "af_fuzz_kolobok");
  });
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

describe("jup_b218_counter_not_3", () => {
  it("should follow the squad members counter", () => {
    expect(callDialogsBinding("jup_b218_counter_not_3")).toBe(true);

    setPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 3);
    expect(callDialogsBinding("jup_b218_counter_not_3")).toBe(false);
  });
});

describe("jup_b218_counter_equal_3", () => {
  it("should follow the squad members counter", () => {
    expect(callDialogsBinding("jup_b218_counter_equal_3")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 3);
    expect(callDialogsBinding("jup_b218_counter_equal_3")).toBe(true);
  });
});

describe("jup_b218_counter_not_0", () => {
  it("should follow the squad members counter", () => {
    expect(callDialogsBinding("jup_b218_counter_not_0")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 3);
    expect(callDialogsBinding("jup_b218_counter_not_0")).toBe(true);
  });
});

describe("jup_b25_frase_count_inc", () => {
  it("should increment the phrase counter through the shared effect", () => {
    callDialogsBinding("jup_b25_frase_count_inc", [registry.actor, MockGameObject.mock()]);
    expect(getPortableStoreValue(ACTOR_ID, "jup_b25_frase", 0)).toBe(1);

    callDialogsBinding("jup_b25_frase_count_inc", [registry.actor, MockGameObject.mock()]);
    expect(getPortableStoreValue(ACTOR_ID, "jup_b25_frase", 0)).toBe(2);
  });
});

describe("jup_b32_anomaly_has_af", () => {
  it("should consume the marked anomaly info only when its zone has an artefact", () => {
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    giveInfoPortion(infoPortions.jup_b32_anomaly_1);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    registry.anomalyZones.set("jup_b32_anomal_zone", { spawnedArtefactsCount: 0 } as AnomalyZoneBinder);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    registry.anomalyZones.set("jup_b32_anomal_zone", { spawnedArtefactsCount: 1 } as AnomalyZoneBinder);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(true);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_1)).toBe(false);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_true)).toBe(true);
  });

  it("should resolve the zone matching the marked anomaly index", () => {
    giveInfoPortion(infoPortions.jup_b32_anomaly_3);
    registry.anomalyZones.set("jup_b209_anomal_zone", { spawnedArtefactsCount: 2 } as AnomalyZoneBinder);

    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(true);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_3)).toBe(false);
  });
});

describe("jup_b4_is_actor_enemies_to_freedom", () => {
  it("should follow the Freedom speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_freedom", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_freedom", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_not_enemies_to_freedom", () => {
  it("should invert the Freedom enemy check", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_freedom", [registry.actor, npc])).toBe(false);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_freedom", [registry.actor, npc])).toBe(true);
  });
});

describe("jup_b4_is_actor_friend_to_freedom", () => {
  it("should follow the Freedom speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_freedom", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_freedom", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_neutral_to_freedom", () => {
  it("should follow the Freedom speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_freedom", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_freedom", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_enemies_to_dolg", () => {
  it("should follow the Duty speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_dolg", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_dolg", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_not_enemies_to_dolg", () => {
  it("should invert the Duty enemy check", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_dolg", [registry.actor, npc])).toBe(false);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_dolg", [registry.actor, npc])).toBe(true);
  });
});

describe("jup_b4_is_actor_friend_to_dolg", () => {
  it("should follow the Duty speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_dolg", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_dolg", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_neutral_to_dolg", () => {
  // Unlike its seven siblings this predicate reads `relation` off the speaker directly instead of going
  // through `getObjectsRelationSafe`.
  it("should follow the Duty speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    MockGameObject.asMock(registry.actor).relation.mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_dolg", [registry.actor, npc])).toBe(true);

    MockGameObject.asMock(registry.actor).relation.mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_dolg", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b47_jupiter_products_info_enabled", () => {
  it("should check the products info document", () => {
    checkHasItemPredicate("jup_b47_jupiter_products_info_enabled", questItems.jup_b47_jupiter_products_info);
  });
});

describe("jup_b47_jupiter_products_info_disabled", () => {
  it("should invert the products info document check", () => {
    checkHasItemPredicate("jup_b47_jupiter_products_info_disabled", questItems.jup_b47_jupiter_products_info, false);
  });
});

describe("jup_b47_jupiter_products_info_revard", () => {
  it("should take the products info and pay the full medicine reward", () => {
    mockActorWith([questItems.jup_b47_jupiter_products_info]);

    checkTransferFromActor("jup_b47_jupiter_products_info_revard", questItems.jup_b47_jupiter_products_info);

    expect(giveMoneyToActor).toHaveBeenCalledWith(7000);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.medkit_scientic, 3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.antirad, 5);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_psy_blockade, 2);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_antidot, 2);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_radioprotector, 2);
  });
});

describe("jup_b47_actor_has_merc_pda", () => {
  it("should check the mercenary PDA", () => {
    checkHasItemPredicate("jup_b47_actor_has_merc_pda", questItems.jup_b47_merc_pda);
  });
});

describe("jup_b47_actor_has_not_merc_pda", () => {
  it("should invert the mercenary PDA check", () => {
    checkHasItemPredicate("jup_b47_actor_has_not_merc_pda", questItems.jup_b47_merc_pda, false);
  });
});

describe("jup_b47_merc_pda_revard", () => {
  it("should take the mercenary PDA and pay for it", () => {
    mockActorWith([questItems.jup_b47_merc_pda]);

    checkTransferFromActor("jup_b47_merc_pda_revard", questItems.jup_b47_merc_pda);
    expect(giveMoneyToActor).toHaveBeenCalledWith(2500);
  });
});

describe("jup_b47_actor_can_take_task", () => {
  it("should accept exactly one of the two b6 outcomes", () => {
    expect(callDialogsBinding("jup_b47_actor_can_take_task")).toBe(false);

    giveInfoPortion(infoPortions.jup_b6_task_done);
    expect(callDialogsBinding("jup_b47_actor_can_take_task")).toBe(true);

    giveInfoPortion(infoPortions.jup_b6_task_fail);
    expect(callDialogsBinding("jup_b47_actor_can_take_task")).toBe(false);
  });

  it("should also accept the failed outcome on its own", () => {
    giveInfoPortion(infoPortions.jup_b6_task_fail);

    expect(callDialogsBinding("jup_b47_actor_can_take_task")).toBe(true);
  });
});

describe("jup_b47_employ_squad", () => {
  it("should accept a started but unfinished bunker guard job", () => {
    expect(callDialogsBinding("jup_b47_employ_squad")).toBe(false);

    giveInfoPortion(infoPortions.jup_b47_bunker_guards_started);
    expect(callDialogsBinding("jup_b47_employ_squad")).toBe(true);

    giveInfoPortion(infoPortions.jup_b47_bunker_guards_done);
    expect(callDialogsBinding("jup_b47_employ_squad")).toBe(false);
  });

  it("should accept an available but unemployed stalker", () => {
    giveInfoPortion(infoPortions.jup_b6_employ_stalker);
    expect(callDialogsBinding("jup_b47_employ_squad")).toBe(true);

    giveInfoPortion(infoPortions.jup_b6_employed_stalker);
    expect(callDialogsBinding("jup_b47_employ_squad")).toBe(false);
  });
});

describe("jup_b47_bunker_guard_revard", () => {
  it("should pay money and the medicine package", () => {
    callDialogsBinding("jup_b47_bunker_guard_revard");

    expect(giveMoneyToActor).toHaveBeenCalledWith(4000);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_psy_blockade, 2);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_antidot, 3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_radioprotector, 3);
  });
});

describe("jup_b47_gauss_rifle_revard", () => {
  it("should pay the gauss documents reward", () => {
    checkMoneyReward("jup_b47_gauss_rifle_revard", 12000);
  });
});

describe("jup_b47_actor_has_hauss_rifle_docs", () => {
  it("should check the gauss rifle documents", () => {
    checkHasItemPredicate("jup_b47_actor_has_hauss_rifle_docs", questItems.zat_a23_gauss_rifle_docs);
  });
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

describe("jup_b211_kill_bludsuckers_reward", () => {
  it("should pay the bloodsucker hunt reward", () => {
    checkMoneyReward("jup_b211_kill_bludsuckers_reward", 3000);
  });
});

describe("jup_b19_transfer_conserva_to_actor", () => {
  it("should give the conserva to the actor", () => {
    checkTransferToActor("jup_b19_transfer_conserva_to_actor", food.conserva);
  });
});

describe("jupiter_b6_sell_halfartefact", () => {
  it("should pay for the half artefact", () => {
    checkMoneyReward("jupiter_b6_sell_halfartefact", 2000);
  });
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

describe("jup_b47_actor_not_enemy_to_freedom", () => {
  it("should follow the Freedom faction hostility", () => {
    jest.mocked(isActorEnemyWithFaction).mockReturnValue(false);
    expect(callDialogsBinding("jup_b47_actor_not_enemy_to_freedom")).toBe(true);

    jest.mocked(isActorEnemyWithFaction).mockReturnValue(true);
    expect(callDialogsBinding("jup_b47_actor_not_enemy_to_freedom")).toBe(false);
  });
});

describe("jup_b47_actor_not_enemy_to_dolg", () => {
  it("should follow the Duty faction hostility", () => {
    jest.mocked(isActorEnemyWithFaction).mockReturnValue(false);
    expect(callDialogsBinding("jup_b47_actor_not_enemy_to_dolg")).toBe(true);

    jest.mocked(isActorEnemyWithFaction).mockReturnValue(true);
    expect(callDialogsBinding("jup_b47_actor_not_enemy_to_dolg")).toBe(false);
  });
});

describe("jup_b15_actor_sci_outfit", () => {
  it("should check the scientific outfit", () => {
    checkHasItemPredicate("jup_b15_actor_sci_outfit", outfits.scientific_outfit);
  });
});

describe("jup_b15_no_actor_sci_outfit", () => {
  it("should invert the scientific outfit check", () => {
    checkHasItemPredicate("jup_b15_no_actor_sci_outfit", outfits.scientific_outfit, false);
  });
});

describe("jup_b19_reward", () => {
  it("should reveal the b19 treasure coordinates", () => {
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("jup_b19_reward");

    expect(giveTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_38");

    giveTreasureCoordinates.mockRestore();
  });
});
