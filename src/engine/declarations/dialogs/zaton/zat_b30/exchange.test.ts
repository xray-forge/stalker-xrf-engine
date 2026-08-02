import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { detectors } from "@/engine/constants/items/detectors";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { giveMoneyToActor, transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";
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
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b30/exchange");
});

describe("zat_b30_transfer_percent", () => {
  it("should pay the rolled share for every accumulated day and reset the counter", () => {
    jest.spyOn(math, "random").mockImplementation(() => 10);
    setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 3);

    callDialogsBinding("zat_b30_transfer_percent", [registry.actor, MockGameObject.mock()]);

    expect(giveMoneyToActor).toHaveBeenCalledWith(3000);
    expect(getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0)).toBe(0);
  });
});
describe("zat_b30_npc_has_detector", () => {
  it("should check the scientific detector on the NPC speaker", () => {
    expect(callDialogsBinding("zat_b30_npc_has_detector", [registry.actor, MockGameObject.mock()])).toBe(false);

    const npc: GameObject = MockGameObject.mock({
      inventory: [[detectors.detector_scientific, MockGameObject.mock({ section: detectors.detector_scientific })]],
    });

    expect(callDialogsBinding("zat_b30_npc_has_detector", [registry.actor, npc])).toBe(true);
  });
});
describe("zat_b30_actor_second_exchange", () => {
  it("should give the scientific detector", () => {
    checkTransferToActor("zat_b30_actor_second_exchange", detectors.detector_scientific);
  });
});
describe("zat_b30_actor_exchange", () => {
  it("should swap the remembered weapon for a scientific detector", () => {
    const npc: GameObject = MockGameObject.mock();

    (registry.actor as AnyObject).goodGun = weapons.wpn_groza;

    callDialogsBinding("zat_b30_actor_exchange", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_groza);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, detectors.detector_scientific);
    expect((registry.actor as AnyObject).goodGun).toBeNull();
  });

  it("should do nothing without a remembered weapon", () => {
    (registry.actor as AnyObject).goodGun = null;

    callDialogsBinding("zat_b30_actor_exchange", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});
describe("zat_b30_actor_has_two_detectors", () => {
  it("should require more than one scientific detector", () => {
    mockActorWith([detectors.detector_scientific]);
    expect(callDialogsBinding("zat_b30_actor_has_two_detectors")).toBe(false);

    mockActorWith([detectors.detector_scientific, detectors.detector_scientific]);
    expect(callDialogsBinding("zat_b30_actor_has_two_detectors")).toBe(true);
  });
});
describe("actor_has_nimble_weapon", () => {
  it("should accept any of the nimble weapons", () => {
    expect(callDialogsBinding("actor_has_nimble_weapon")).toBe(false);

    for (const weapon of [weapons.wpn_groza_nimble, weapons.wpn_vintorez_nimble, weapons.wpn_svu_nimble]) {
      mockActorWith([weapon]);
      expect(callDialogsBinding("actor_has_nimble_weapon")).toBe(true);
    }
  });

  it("should reject a plain weapon", () => {
    mockActorWith([weapons.wpn_groza]);

    expect(callDialogsBinding("actor_has_nimble_weapon")).toBe(false);
  });
});
