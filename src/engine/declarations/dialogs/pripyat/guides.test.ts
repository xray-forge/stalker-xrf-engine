import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_pripyat"]);
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/pripyat/guides");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pay_cost_to_guide_to_zaton", () => {
  it("should charge the full fee and the discounted one once maps are given", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pay_cost_to_guide_to_zaton", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 3000);

    giveInfoPortion(infoPortions.zat_b215_gave_maps);

    callDialogsBinding("pay_cost_to_guide_to_zaton", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 1000);
  });
});

describe("jup_b43_actor_has_10000_money", () => {
  it("should require 5000 money by default", () => {
    resetRegistry();
    mockRegisteredActor({ money: 4999 });
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(false);

    resetRegistry();
    mockRegisteredActor({ money: 5000 });
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(true);
  });

  it("should require only 3000 money once maps are given", () => {
    resetRegistry();
    mockRegisteredActor({ money: 2999 });
    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(false);

    resetRegistry();
    mockRegisteredActor({ money: 3000 });
    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(true);
  });
});

describe("jup_b43_actor_do_not_has_10000_money", () => {
  it("should invert the Zaton guide fee affordability check", () => {
    resetRegistry();
    mockRegisteredActor({ money: 4999 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_10000_money")).toBe(true);

    resetRegistry();
    mockRegisteredActor({ money: 5000 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_10000_money")).toBe(false);

    resetRegistry();
    mockRegisteredActor({ money: 3000 });
    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    expect(callDialogsBinding("jup_b43_actor_do_not_has_10000_money")).toBe(false);
  });
});

describe("pay_cost_to_guide_to_jupiter", () => {
  it("should charge a flat Jupiter guide fee", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pay_cost_to_guide_to_jupiter", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledTimes(1);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 7000);
  });

  it("should not discount the Jupiter fee when maps are given", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    callDialogsBinding("pay_cost_to_guide_to_jupiter", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 7000);
  });
});

describe("jup_b43_actor_has_7000_money", () => {
  it("should check the 7000 money threshold", () => {
    resetRegistry();
    mockRegisteredActor({ money: 6999 });
    expect(callDialogsBinding("jup_b43_actor_has_7000_money")).toBe(false);

    resetRegistry();
    mockRegisteredActor({ money: 7000 });
    expect(callDialogsBinding("jup_b43_actor_has_7000_money")).toBe(true);
  });
});

describe("jup_b43_actor_do_not_has_7000_money", () => {
  it("should invert the 7000 money threshold", () => {
    resetRegistry();
    mockRegisteredActor({ money: 6999 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_7000_money")).toBe(true);

    resetRegistry();
    mockRegisteredActor({ money: 7000 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_7000_money")).toBe(false);
  });
});
