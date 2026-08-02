import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { helmets } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";
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

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b51/merchant");
});

describe("zat_b51_randomize_item", () => {
  it("should order one of the still available items of the active category", () => {
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_done_item_1_1" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_done_item_1_2" as TInfoPortion);
    jest.spyOn(math, "random").mockImplementation(() => 1);

    callDialogsBinding("zat_b51_randomize_item", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.has_info("zat_b51_ordered_item_1_3" as TInfoPortion)).toBe(true);
  });

  it("should order nothing while no category is being processed", () => {
    callDialogsBinding("zat_b51_randomize_item", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.has_info("zat_b51_ordered_item_1_1" as TInfoPortion)).toBe(false);
  });
});
describe("zat_b51_give_prepay", () => {
  it("should take the agreed prepay for the active category", () => {
    const npc: GameObject = MockGameObject.mock();

    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);

    callDialogsBinding("zat_b51_give_prepay", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 700);
  });

  it("should double the prepay once the order was refused", () => {
    const npc: GameObject = MockGameObject.mock();

    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion(infoPortions.zat_b51_order_refused);

    callDialogsBinding("zat_b51_give_prepay", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 1400);
  });
});
describe("zat_b51_has_prepay", () => {
  it("should check the agreed prepay threshold of the active category", () => {
    mockActorWith([], { money: 699 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_has_prepay")).toBe(false);

    mockActorWith([], { money: 700 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_has_prepay")).toBe(true);
  });

  it("should check the doubled threshold once the order was refused", () => {
    mockActorWith([], { money: 1399 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion(infoPortions.zat_b51_order_refused);
    expect(callDialogsBinding("zat_b51_has_prepay")).toBe(false);

    mockActorWith([], { money: 1400 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion(infoPortions.zat_b51_order_refused);
    expect(callDialogsBinding("zat_b51_has_prepay")).toBe(true);
  });
});
describe("zat_b51_hasnt_prepay", () => {
  it("should invert the prepay affordability check", () => {
    mockActorWith([], { money: 699 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_hasnt_prepay", [registry.actor, MockGameObject.mock()])).toBe(true);

    mockActorWith([], { money: 700 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_hasnt_prepay", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});
describe("zat_b51_buy_item", () => {
  it("should hand over the ordered item, charge its cost, and mark it done", () => {
    const npc: GameObject = MockGameObject.mock();

    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_ordered_item_1_1" as TInfoPortion);

    callDialogsBinding("zat_b51_buy_item", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, weapons.wpn_desert_eagle_nimble);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 2800);
    expect(registry.actor.has_info("zat_b51_done_item_1_1" as TInfoPortion)).toBe(true);
    expect(registry.actor.has_info("zat_b51_processing_category_1" as TInfoPortion)).toBe(false);
    expect(registry.actor.has_info("zat_b51_ordered_item_1_1" as TInfoPortion)).toBe(false);
  });

  it("should hand over every item of a multi-item category", () => {
    const npc: GameObject = MockGameObject.mock();

    registry.actor.give_info_portion("zat_b51_processing_category_5" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_ordered_item_5_1" as TInfoPortion);

    callDialogsBinding("zat_b51_buy_item", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, helmets.helm_tactic);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, outfits.cs_heavy_outfit);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 32000);
  });

  it("should mark the category as finished once every item is done", () => {
    registry.actor.give_info_portion("zat_b51_processing_category_6" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_ordered_item_6_1" as TInfoPortion);

    callDialogsBinding("zat_b51_buy_item", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.has_info("zat_b51_finishing_category_6" as TInfoPortion)).toBe(true);
  });
});
describe("zat_b51_refuse_item", () => {
  it("should drop the order and stop processing the category", () => {
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_ordered_item_1_1" as TInfoPortion);

    callDialogsBinding("zat_b51_refuse_item", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.has_info("zat_b51_processing_category_1" as TInfoPortion)).toBe(false);
    expect(registry.actor.has_info("zat_b51_ordered_item_1_1" as TInfoPortion)).toBe(false);
  });
});
describe("zat_b51_has_item_cost", () => {
  it("should check the full cost of the active category", () => {
    mockActorWith([], { money: 2799 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_has_item_cost")).toBe(false);

    mockActorWith([], { money: 2800 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_has_item_cost")).toBe(true);
  });

  it("should be false while no category is being processed", () => {
    mockActorWith([], { money: 100000 });

    expect(callDialogsBinding("zat_b51_has_item_cost")).toBe(false);
  });
});
describe("zat_b51_hasnt_item_cost", () => {
  it("should invert the full cost check", () => {
    mockActorWith([], { money: 2799 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_hasnt_item_cost", [registry.actor, MockGameObject.mock()])).toBe(true);

    mockActorWith([], { money: 2800 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_hasnt_item_cost", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});
