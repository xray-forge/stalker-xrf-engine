import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { artefacts } from "@/engine/constants/items/artefacts";
import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { giveItemsToActor, transferItemsFromActor, transferMoneyFromActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
}

function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

function checkHasItemPredicate(name: TName, section: TSection, expected: boolean = true): void {
  mockActorWith([]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expected);

  mockActorWith([section]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expected);
}

function checkMoneyPredicate(name: TName, amount: TCount, expectedWhenEnough: boolean = true): void {
  mockActorWith([], { money: amount - 1 });
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expectedWhenEnough);

  mockActorWith([], { money: amount });
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expectedWhenEnough);
}

function checkTransferFromActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section, count);
  }
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferMoneyFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/effects/game/set_counter");
  require("@/engine/declarations/effects/game/dec_counter");
  require("@/engine/declarations/dialogs/zaton/zat_b33/hideout");
});

describe("zat_b33_set_counter_10", () => {
  it("should set the items counter to ten", () => {
    callDialogsBinding("zat_b33_set_counter_10", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(10);
  });
});
describe("zat_b33_counter_ge_2", () => {
  it("should check the items counter against two", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 1);
    expect(callDialogsBinding("zat_b33_counter_ge_2")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 2);
    expect(callDialogsBinding("zat_b33_counter_ge_2")).toBe(true);
  });
});
describe("zat_b33_counter_ge_4", () => {
  it("should check the items counter against four", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 3);
    expect(callDialogsBinding("zat_b33_counter_ge_4")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 4);
    expect(callDialogsBinding("zat_b33_counter_ge_4")).toBe(true);
  });
});
describe("zat_b33_counter_ge_8", () => {
  it("should check the items counter against eight", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 7);
    expect(callDialogsBinding("zat_b33_counter_ge_8")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 8);
    expect(callDialogsBinding("zat_b33_counter_ge_8")).toBe(true);
  });
});
describe("zat_b33_counter_le_2", () => {
  it("should invert the counter check against two", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 1);
    expect(callDialogsBinding("zat_b33_counter_le_2", [registry.actor, MockGameObject.mock()])).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 2);
    expect(callDialogsBinding("zat_b33_counter_le_2", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});
describe("zat_b33_counter_le_4", () => {
  it("should invert the counter check against four", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 3);
    expect(callDialogsBinding("zat_b33_counter_le_4", [registry.actor, MockGameObject.mock()])).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 4);
    expect(callDialogsBinding("zat_b33_counter_le_4", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});
describe("zat_b33_counter_le_8", () => {
  it("should invert the counter check against eight", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 7);
    expect(callDialogsBinding("zat_b33_counter_le_8", [registry.actor, MockGameObject.mock()])).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 8);
    expect(callDialogsBinding("zat_b33_counter_le_8", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});
describe("zat_b33_counter_de_2", () => {
  it("should decrement the items counter by two", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);

    callDialogsBinding("zat_b33_counter_de_2", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(8);
  });
});
describe("zat_b33_counter_de_4", () => {
  it("should decrement the items counter by four", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);

    callDialogsBinding("zat_b33_counter_de_4", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(6);
  });
});
describe("zat_b33_counter_de_8", () => {
  it("should decrement the items counter by eight and clamp at zero", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);
    callDialogsBinding("zat_b33_counter_de_8", [registry.actor, MockGameObject.mock()]);
    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(2);

    callDialogsBinding("zat_b33_counter_de_8", [registry.actor, MockGameObject.mock()]);
    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(0);
  });
});
describe("zat_b33_counter_eq_10", () => {
  it("should match only the exact counter value", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 9);
    expect(callDialogsBinding("zat_b33_counter_eq_10")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);
    expect(callDialogsBinding("zat_b33_counter_eq_10")).toBe(true);
  });
});
describe("zat_b33_counter_ne_10", () => {
  it("should invert the exact counter match", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 9);
    expect(callDialogsBinding("zat_b33_counter_ne_10", [registry.actor, MockGameObject.mock()])).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);
    expect(callDialogsBinding("zat_b33_counter_ne_10", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});
describe("zat_b33_transfer_first_item", () => {
  it("should give the snag pistol", () => {
    callDialogsBinding("zat_b33_transfer_first_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.wpn_fort_snag);
  });
});
describe("zat_b33_transfer_second_item", () => {
  it("should give the medicine pack", () => {
    callDialogsBinding("zat_b33_transfer_second_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledTimes(3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.medkit_scientic, 3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.antirad, 3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.bandage, 5);
  });
});
describe("zat_b33_transfer_third_item", () => {
  it("should give the snag rifle", () => {
    callDialogsBinding("zat_b33_transfer_third_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.wpn_ak74u_snag);
  });
});
describe("zat_b33_transfer_fourth_item", () => {
  it("should give the soul artefact", () => {
    callDialogsBinding("zat_b33_transfer_fourth_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledWith(artefacts.af_soul);
  });
});
describe("zat_b33_transfer_fifth_item", () => {
  it("should give the snag hardhat", () => {
    callDialogsBinding("zat_b33_transfer_fifth_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.helm_hardhat_snag);
  });
});
describe("zat_b33_transfer_safe_container", () => {
  it("should take the safe container", () => {
    checkTransferFromActor("zat_b33_transfer_safe_container", questItems.zat_b33_safe_container);
  });
});
describe("zat_b33_aractor_has_habar", () => {
  it("should check the safe container", () => {
    checkHasItemPredicate("zat_b33_aractor_has_habar", questItems.zat_b33_safe_container);
  });
});
describe("zat_b33_actor_hasnt_habar", () => {
  it("should invert the safe container check", () => {
    checkHasItemPredicate("zat_b33_actor_hasnt_habar", questItems.zat_b33_safe_container, false);
  });
});
describe("zat_b33_actor_has_needed_money", () => {
  it("should check the 500 money threshold", () => {
    checkMoneyPredicate("zat_b33_actor_has_needed_money", 500);
  });
});
describe("zat_b33_actor_hasnt_needed_money", () => {
  it("should invert the 500 money threshold", () => {
    checkMoneyPredicate("zat_b33_actor_hasnt_needed_money", 500, false);
  });
});
describe("zat_b33_relocate_money", () => {
  it("should take the money only when the actor can afford it", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([], { money: 499 });
    callDialogsBinding("zat_b33_relocate_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).not.toHaveBeenCalled();

    mockActorWith([], { money: 500 });
    callDialogsBinding("zat_b33_relocate_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 500);
  });
});
