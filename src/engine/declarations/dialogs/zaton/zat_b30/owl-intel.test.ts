import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

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
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b30/owl-intel");
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info", () => {
  it("should sell the evacuation info and record the sale", () => {
    checkSale(
      "jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
      questItems.jup_a9_evacuation_info,
      750,
      infoPortions.jup_a9_evacuation_info_sold
    );
  });
});
describe("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info", () => {
  it("should sell the meeting info and record the sale", () => {
    checkSale(
      "jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
      questItems.jup_a9_meeting_info,
      750,
      infoPortions.jup_a9_meeting_info_sold
    );
  });
});
describe("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info", () => {
  it("should sell the losses info and record the sale", () => {
    checkSale(
      "jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
      questItems.jup_a9_losses_info,
      750,
      infoPortions.jup_a9_losses_info_sold
    );
  });
});
describe("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info", () => {
  it("should sell the delivery info and record the sale", () => {
    checkSale(
      "jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
      questItems.jup_a9_delivery_info,
      750,
      infoPortions.jup_a9_delivery_info_sold
    );
  });
});
describe("zat_b30_owl_stalker_trader_sell_device_flash_snag", () => {
  it("should sell the flash snag and record the sale", () => {
    checkSale(
      "zat_b30_owl_stalker_trader_sell_device_flash_snag",
      questItems.device_flash_snag,
      200,
      infoPortions.device_flash_snag_sold
    );
  });
});
describe("zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader", () => {
  it("should sell the bandit leader PDA and record the sale", () => {
    checkSale(
      "zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader",
      questItems.device_pda_port_bandit_leader,
      1000,
      infoPortions.device_pda_port_bandit_leader_sold
    );
  });
});
describe("zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory", () => {
  it("should sell the second UFO memory and record the sale", () => {
    checkSale(
      "zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory",
      questItems.jup_b10_ufo_memory_2,
      500,
      infoPortions.jup_b10_ufo_memory_2_sold
    );
  });
});
describe("zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda", () => {
  it("should sell the b202 bandit PDA", () => {
    checkSale("zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda", questItems.jup_b202_bandit_pda, 500);
  });
});
