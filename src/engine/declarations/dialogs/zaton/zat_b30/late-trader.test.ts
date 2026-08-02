import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { TInfoPortion } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { detectors } from "@/engine/constants/items/detectors";
import { questItems } from "@/engine/constants/items/quest_items";
import { getManager, registry } from "@/engine/core/database";
import { setPortableStoreValue } from "@/engine/core/database/portable_store";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { giveMoneyToActor, transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";
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

function checkMoneyReward(name: TName, amount: TCount): void {
  callDialogsBinding(name, [registry.actor, MockGameObject.mock()]);

  expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  expect(giveMoneyToActor).toHaveBeenCalledWith(amount);
}

function checkTransferToActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
  }
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
  resetFunctionMock(transferItemsToActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b30/late-trader");
});

describe("zat_b30_transfer_detector_to_actor", () => {
  it("should give the scientific detector", () => {
    checkTransferToActor("zat_b30_transfer_detector_to_actor", detectors.detector_scientific);
  });
});
describe("zat_b30_give_owls_share_to_actor", () => {
  it("should pay the Owl share", () => {
    checkMoneyReward("zat_b30_give_owls_share_to_actor", 1500);
  });
});
describe("zat_b30_actor_has_compass", () => {
  it("should check the compass artefact", () => {
    checkHasItemPredicate("zat_b30_actor_has_compass", artefacts.af_compass);
  });
});
describe("zat_b30_transfer_af_from_actor", () => {
  it("should take the compass, pay for it, and reveal both treasures", () => {
    const npc: GameObject = MockGameObject.mock();
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callDialogsBinding("zat_b30_transfer_af_from_actor", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefacts.af_compass);
    expect(giveMoneyToActor).toHaveBeenCalledWith(10000);
    expect(coordinates).toHaveBeenCalledWith("zat_hiding_place_49");
    expect(coordinates).toHaveBeenCalledWith("zat_hiding_place_15");

    coordinates.mockRestore();
  });
});
describe("zat_b30_barmen_has_percent", () => {
  it("should follow the accumulated days counter", () => {
    expect(callDialogsBinding("zat_b30_barmen_has_percent")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 1);
    expect(callDialogsBinding("zat_b30_barmen_has_percent")).toBe(true);
  });
});
describe("zat_b30_barmen_do_not_has_percent", () => {
  it("should invert the accumulated days counter", () => {
    expect(callDialogsBinding("zat_b30_barmen_do_not_has_percent")).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 1);
    expect(callDialogsBinding("zat_b30_barmen_do_not_has_percent")).toBe(false);
  });
});
describe("zat_b30_actor_has_noah_pda", () => {
  it("should check the Noah PDA", () => {
    checkHasItemPredicate("zat_b30_actor_has_noah_pda", questItems.zat_b20_noah_pda);
  });
});
describe("zat_b30_sell_noah_pda", () => {
  it("should sell the Noah PDA", () => {
    checkSale("zat_b30_sell_noah_pda", questItems.zat_b20_noah_pda, 1000);
  });
});
