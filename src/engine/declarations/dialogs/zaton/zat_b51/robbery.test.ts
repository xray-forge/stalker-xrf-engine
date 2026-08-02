import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { artefacts } from "@/engine/constants/items/artefacts";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { transferItemsFromActor, transferItemsToActor, transferMoneyFromActor } from "@/engine/core/utils/reward";
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

function checkTransferToActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
  }
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b51/robbery");
});

describe("zat_b51_robbery", () => {
  it("should take a rolled share of the money and every listed weapon", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 40);
    mockActorWith([weapons.wpn_groza, weapons.wpn_svd], { money: 1000 });

    callDialogsBinding("zat_b51_robbery", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 400);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_groza, "all");
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_svd, "all");
  });

  it("should leave weapons that are not on the list alone", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 40);
    mockActorWith([weapons.wpn_pm], { money: 100 });

    callDialogsBinding("zat_b51_robbery", [registry.actor, npc]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});
describe("zat_b51_rob_nimble_weapon", () => {
  it("should take exactly one of the carried nimble weapons", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([weapons.wpn_groza_nimble, weapons.wpn_svd_nimble]);
    jest.spyOn(math, "random").mockImplementation(() => 1);

    callDialogsBinding("zat_b51_rob_nimble_weapon", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect([weapons.wpn_groza_nimble, weapons.wpn_svd_nimble]).toContain(
      jest.mocked(transferItemsFromActor).mock.calls[0][1]
    );
  });

  it("should immediately take an equipped nimble weapon", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([weapons.wpn_groza_nimble]);
    MockGameObject.asMock(registry.actor).item_in_slot.mockImplementation(((slot: TCount) =>
      slot === 2 ? MockGameObject.mock({ section: weapons.wpn_groza_nimble }) : null) as never);

    callDialogsBinding("zat_b51_rob_nimble_weapon", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_groza_nimble);
  });

  it("should leave plain weapons alone", () => {
    mockActorWith([weapons.wpn_groza]);

    callDialogsBinding("zat_b51_rob_nimble_weapon", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});
describe("give_compass_to_actor", () => {
  it("should give the compass artefact", () => {
    checkTransferToActor("give_compass_to_actor", artefacts.af_compass);
  });
});
