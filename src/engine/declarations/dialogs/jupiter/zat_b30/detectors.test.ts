import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { detectors } from "@/engine/constants/items/detectors";
import { registry } from "@/engine/core/database";
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

/**
 * Verify an action transfers the expected section from the actor to the NPC speaker.
 */
function checkTransferFromActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section, count);
  }
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/zat_b30/detectors");
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

describe("zat_b30_transfer_detectors", () => {
  it("should transfer three elite detectors to the NPC", () => {
    checkTransferFromActor("zat_b30_transfer_detectors", detectors.detector_elite, 3);
  });
});

describe("zat_b30_actor_has_transfer_items", () => {
  it("should require at least three elite detectors in the inventory", () => {
    expect(callDialogsBinding("zat_b30_actor_has_transfer_items")).toBe(false);

    mockActorWith([detectors.detector_elite, detectors.detector_elite]);
    expect(callDialogsBinding("zat_b30_actor_has_transfer_items")).toBe(false);

    mockActorWith([detectors.detector_elite, detectors.detector_elite, detectors.detector_elite]);
    expect(callDialogsBinding("zat_b30_actor_has_transfer_items")).toBe(true);
  });
});

describe("zat_b30_actor_do_not_has_transfer_items", () => {
  it("should invert the elite detector count check", () => {
    expect(callDialogsBinding("zat_b30_actor_do_not_has_transfer_items", [registry.actor, MockGameObject.mock()])).toBe(
      true
    );

    mockActorWith([detectors.detector_elite, detectors.detector_elite, detectors.detector_elite]);
    expect(callDialogsBinding("zat_b30_actor_do_not_has_transfer_items", [registry.actor, MockGameObject.mock()])).toBe(
      false
    );
  });
});
