import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { giveMoneyToActor, transferItemsFromActor, transferMoneyFromActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function checkMoneyTransfer(name: TName, amount: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  expect(transferMoneyFromActor).toHaveBeenCalledTimes(1);
  expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, amount);
}

function checkSale(name: TName, section: TSection, reward: TCount, soldInfo?: TInfoPortion): void {
  const npc: GameObject = MockGameObject.mock();

  mockActorWith([section]);

  callDialogsBinding(name, [registry.actor, npc]);

  expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  expect(giveMoneyToActor).toHaveBeenCalledWith(reward);

  if (soldInfo) {
    expect(registry.actor.has_info(soldInfo)).toBe(true);
  }
}

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

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferMoneyFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b30/owl-sales");
});

describe("zat_b30_transfer_1000", () => {
  it("should take 1000 money", () => {
    checkMoneyTransfer("zat_b30_transfer_1000", 1000);
  });
});
describe("zat_b30_transfer_200", () => {
  it("should take 200 money", () => {
    checkMoneyTransfer("zat_b30_transfer_200", 200);
  });
});
describe("zat_b30_sell_pri_b36_monolith_hiding_place_pda", () => {
  it("should sell the monolith hiding place PDA", () => {
    checkSale("zat_b30_sell_pri_b36_monolith_hiding_place_pda", questItems.pri_b36_monolith_hiding_place_pda, 5000);
  });
});
describe("zat_b30_sell_pri_b306_envoy_pda", () => {
  it("should sell the envoy PDA", () => {
    checkSale("zat_b30_sell_pri_b306_envoy_pda", questItems.pri_b306_envoy_pda, 4000);
  });
});
describe("zat_b30_sell_jup_b207_merc_pda_with_contract", () => {
  it("should sell the contract PDA and record the sale", () => {
    checkSale(
      "zat_b30_sell_jup_b207_merc_pda_with_contract",
      questItems.jup_b207_merc_pda_with_contract,
      1000,
      infoPortions.jup_b207_merc_pda_with_contract_sold
    );
  });
});
describe("zat_b30_sell_jup_b10_strelok_notes_1", () => {
  it("should sell the first Strelok note", () => {
    checkSale("zat_b30_sell_jup_b10_strelok_notes_1", questItems.jup_b10_notes_01, 500);
  });
});
describe("zat_b30_sell_jup_b10_strelok_notes_2", () => {
  it("should sell the second Strelok note", () => {
    checkSale("zat_b30_sell_jup_b10_strelok_notes_2", questItems.jup_b10_notes_02, 500);
  });
});
describe("zat_b30_sell_jup_b10_strelok_notes_3", () => {
  it("should sell the third Strelok note", () => {
    checkSale("zat_b30_sell_jup_b10_strelok_notes_3", questItems.jup_b10_notes_03, 500);
  });
});
