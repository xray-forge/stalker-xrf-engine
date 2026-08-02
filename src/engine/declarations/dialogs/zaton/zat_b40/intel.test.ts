import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
}

function checkHasItemPredicate(name: TName, section: TSection, expected: boolean = true): void {
  mockActorWith([]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expected);

  mockActorWith([section]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expected);
}

function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b40/intel");
});

describe("zat_b40_transfer_notebook", () => {
  it("should sell the notebook and record the sale", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b40_transfer_notebook", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b40_notebook);
    expect(registry.actor.has_info(infoPortions.zat_b40_notebook_saled)).toBe(true);
    expect(giveMoneyToActor).toHaveBeenCalledWith(2000);
  });
});
describe("zat_b40_transfer_merc_pda_1", () => {
  it("should sell the first mercenary PDA and record the sale", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b40_transfer_merc_pda_1", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b40_pda_1);
    expect(registry.actor.has_info(infoPortions.zat_b40_pda_1_saled)).toBe(true);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
  });
});
describe("zat_b40_transfer_merc_pda_2", () => {
  it("should sell the second mercenary PDA and record the sale", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b40_transfer_merc_pda_2", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b40_pda_2);
    expect(registry.actor.has_info(infoPortions.zat_b40_pda_2_saled)).toBe(true);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
  });
});
describe("zat_b40_actor_has_notebook", () => {
  it("should check the notebook", () => {
    checkHasItemPredicate("zat_b40_actor_has_notebook", questItems.zat_b40_notebook);
  });
});
describe("zat_b40_actor_has_merc_pda_1", () => {
  it("should check the first mercenary PDA", () => {
    checkHasItemPredicate("zat_b40_actor_has_merc_pda_1", questItems.zat_b40_pda_1);
  });
});
describe("zat_b40_actor_has_merc_pda_2", () => {
  it("should check the second mercenary PDA", () => {
    checkHasItemPredicate("zat_b40_actor_has_merc_pda_2", questItems.zat_b40_pda_2);
  });
});
