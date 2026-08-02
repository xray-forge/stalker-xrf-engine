import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { getObjectsRelationSafe, isActorEnemyWithFaction } from "@/engine/core/utils/relation";
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
jest.mock("@/engine/core/utils/relation");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b47/mercenaries");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(getObjectsRelationSafe);
  resetFunctionMock(isActorEnemyWithFaction);
  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
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
