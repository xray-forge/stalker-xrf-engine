import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { misc } from "@/engine/constants/items/misc";
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
  require("@/engine/declarations/dialogs/zaton/toolkits");
});

describe("check_npc_name_mechanics", () => {
  it("should accept a plain stalker speaker", () => {
    const npc: GameObject = MockGameObject.mock({ name: "zat_b30_stalker_1" });

    expect(callDialogsBinding("check_npc_name_mechanics", [registry.actor, npc])).toBe(true);
  });

  it("should reject every excluded speaker name", () => {
    for (const name of ["mechanic_stalker", "zat_b103_lost_merc_stalker", "tech_stalker", "zulus_stalker"]) {
      const npc: GameObject = MockGameObject.mock({ name });

      expect(callDialogsBinding("check_npc_name_mechanics", [registry.actor, npc])).toBe(false);
    }
  });

  it("should reject a speaker that is not a stalker at all", () => {
    const npc: GameObject = MockGameObject.mock({ name: "zat_b30_owl" });

    expect(callDialogsBinding("check_npc_name_mechanics", [registry.actor, npc])).toBe(false);
  });
});
describe("give_toolkit_1", () => {
  it("should take the first toolkit, clear it, and pay for it", () => {
    const npc: GameObject = MockGameObject.mock();

    (registry.actor as AnyObject).toolkit = misc.toolkit_1;

    callDialogsBinding("give_toolkit_1", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, misc.toolkit_1);
    expect((registry.actor as AnyObject).toolkit).toBeNull();
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
  });
});
describe("give_toolkit_2", () => {
  it("should take the second toolkit and pay for it", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("give_toolkit_2", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, misc.toolkit_2);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1200);
  });
});
describe("give_toolkit_3", () => {
  it("should take the third toolkit and pay for it", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("give_toolkit_3", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, misc.toolkit_3);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1500);
  });
});
describe("if_actor_has_toolkit_1", () => {
  it("should check the first toolkit", () => {
    checkHasItemPredicate("if_actor_has_toolkit_1", misc.toolkit_1);
  });
});
describe("if_actor_has_toolkit_2", () => {
  it("should check the second toolkit", () => {
    checkHasItemPredicate("if_actor_has_toolkit_2", misc.toolkit_2);
  });
});
describe("if_actor_has_toolkit_3", () => {
  it("should check the third toolkit", () => {
    checkHasItemPredicate("if_actor_has_toolkit_3", misc.toolkit_3);
  });
});
