import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { misc } from "@/engine/constants/items/misc";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
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

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b217/toolkit");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
});

describe("jup_b217_actor_got_toolkit", () => {
  it("should detect a toolkit that has not been brought yet", () => {
    expect(callDialogsBinding("jup_b217_actor_got_toolkit")).toBe(false);

    mockActorWith([misc.toolkit_2]);
    expect(callDialogsBinding("jup_b217_actor_got_toolkit")).toBe(true);
    expect((registry.actor as AnyObject).toolkit).toBe(misc.toolkit_2);
  });

  it("should ignore a toolkit that was already brought", () => {
    mockActorWith([misc.toolkit_1]);
    giveInfoPortion(infoPortions.jup_b217_tech_instrument_1_brought);

    expect(callDialogsBinding("jup_b217_actor_got_toolkit")).toBe(false);
  });
});
