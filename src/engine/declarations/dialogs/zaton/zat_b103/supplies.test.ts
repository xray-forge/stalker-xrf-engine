import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { food } from "@/engine/constants/items/food";
import { misc } from "@/engine/constants/items/misc";
import { registry } from "@/engine/core/database";
import { transferItemsFromActor } from "@/engine/core/utils/reward";
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

function checkTransferFromActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section, count);
  }
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(transferItemsFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b103/supplies");
});

describe("zat_b103_transfer_merc_supplies", () => {
  it("should move up to six food items to the NPC", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([
      food.conserva,
      food.conserva,
      food.conserva,
      food.kolbasa,
      food.kolbasa,
      food.bread,
      food.bread,
      food.bread,
    ]);

    callDialogsBinding("zat_b103_transfer_merc_supplies", [registry.actor, npc]);

    expect(MockGameObject.asMock(registry.actor).transfer_item).toHaveBeenCalledTimes(6);
  });

  it("should move nothing when the actor carries no food", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b103_transfer_merc_supplies", [registry.actor, npc]);

    expect(MockGameObject.asMock(registry.actor).transfer_item).not.toHaveBeenCalled();
  });
});
describe("zat_b103_transfer_mechanic_toolkit_2", () => {
  it("should take the second toolkit", () => {
    checkTransferFromActor("zat_b103_transfer_mechanic_toolkit_2", misc.toolkit_2);
  });
});
describe("zat_b103_actor_has_needed_food", () => {
  it("should require six food items in total", () => {
    mockActorWith([food.bread, food.kolbasa, food.conserva, food.bread, food.kolbasa]);
    expect(callDialogsBinding("zat_b103_actor_has_needed_food")).toBe(false);

    mockActorWith([food.bread, food.kolbasa, food.conserva, food.bread, food.kolbasa, food.conserva]);
    expect(callDialogsBinding("zat_b103_actor_has_needed_food")).toBe(true);
  });
});
