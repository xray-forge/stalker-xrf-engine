import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { getManager, registerStoryLink, registry } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { giveMoneyToActor, transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";
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
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b7/raiders");
});

describe("zat_b7_give_bandit_reward_to_actor", () => {
  it("should pay a randomized reward and reveal the treasure", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    jest.spyOn(math, "random").mockImplementation(() => 20);

    callDialogsBinding("zat_b7_give_bandit_reward_to_actor");

    expect(giveMoneyToActor).toHaveBeenCalledWith(2000);
    expect(coordinates).toHaveBeenCalledWith("zat_hiding_place_30");

    coordinates.mockRestore();
  });
});
describe("zat_b7_give_stalker_reward_to_actor", () => {
  it("should hand over the drug pack matching the rolled variant", () => {
    const variants: Array<[TCount, TSection, TCount]> = [
      [1, drugs.bandage, 6],
      [2, drugs.medkit, 2],
      [3, drugs.antirad, 3],
    ];
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    for (const [roll, section, count] of variants) {
      const npc: GameObject = MockGameObject.mock();

      resetFunctionMock(transferItemsToActor);
      jest.spyOn(math, "random").mockImplementation(() => roll);

      callDialogsBinding("zat_b7_give_stalker_reward_to_actor", [registry.actor, npc]);

      expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
      expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.vodka, 4);
    }

    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_29");

    giveTreasureCoordinates.mockRestore();
  });
});
describe("zat_b7_give_stalker_reward_2_to_actor", () => {
  it("should hand over the fixed drug pack", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b7_give_stalker_reward_2_to_actor", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 2);
  });
});
describe("zat_b7_rob_actor", () => {
  it("should take the rolled share of the actor money", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 80);
    mockActorWith([], { money: 1000 });

    callDialogsBinding("zat_b7_rob_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 800);
  });

  it("should never take more than the actor owns", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 100);
    mockActorWith([], { money: 0 });

    callDialogsBinding("zat_b7_rob_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 0);
  });
});
describe("zat_b7_squad_alive", () => {
  it("should follow the victims squad story object existence", () => {
    expect(callDialogsBinding("zat_b7_squad_alive")).toBe(false);

    registerStoryLink(MockAlifeHumanStalker.mock().id, "zat_b7_stalkers_victims_1");
    expect(callDialogsBinding("zat_b7_squad_alive")).toBe(true);
  });
});
describe("zat_b7_killed_self_precond", () => {
  it("should require the squad to be gone and both info portions unset", () => {
    expect(callDialogsBinding("zat_b7_killed_self_precond")).toBe(true);

    registerStoryLink(MockAlifeHumanStalker.mock().id, "zat_b7_stalkers_victims_1");
    expect(callDialogsBinding("zat_b7_killed_self_precond")).toBe(false);
  });

  it("should close once either meeting info portion is set", () => {
    registry.actor.give_info_portion(infoPortions.zat_b7_stalkers_raiders_meet);
    expect(callDialogsBinding("zat_b7_killed_self_precond")).toBe(false);

    mockActorWith([]);
    registry.actor.give_info_portion(infoPortions.zat_b7_victims_disappeared);
    expect(callDialogsBinding("zat_b7_killed_self_precond")).toBe(false);
  });
});
