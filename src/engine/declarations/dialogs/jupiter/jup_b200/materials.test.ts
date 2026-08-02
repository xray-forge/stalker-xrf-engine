import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
}

/**
 * Re-register the actor carrying the provided sections, dropping any previously given info portions.
 *
 * Inventory keys are index-suffixed so repeating the same section registers separate items, while
 * `object(section)` lookups still resolve by section.
 */
function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/effects/game/inc_counter");
  require("@/engine/declarations/dialogs/jupiter/jup_b200/materials");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("jupiter_b200_tech_materials_relocate", () => {
  it("should transfer every tech material and count them", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([
      questItems.jup_b200_tech_materials_wire,
      questItems.jup_b200_tech_materials_wire,
      questItems.jup_b200_tech_materials_acetone,
      "wpn_pm",
    ]);

    callDialogsBinding("jupiter_b200_tech_materials_relocate", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(2);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b200_tech_materials_wire, 2);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b200_tech_materials_acetone, 1);

    // The counter is incremented through `xr_effects.inc_counter` with a `tostring(count)` argument, mirroring the
    // original script. Lua coerces that back to a number, so the exact stored value is not asserted here.
    expect(getPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_brought_counter", 0)).not.toBe(0);
  });

  it("should transfer nothing when the actor carries no tech material", () => {
    callDialogsBinding("jupiter_b200_tech_materials_relocate", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});
