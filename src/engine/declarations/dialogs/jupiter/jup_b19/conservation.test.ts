import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { food } from "@/engine/constants/items/food";
import { registry } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
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
 * Verify an action transfers the expected section from the NPC speaker to the actor.
 */
function checkTransferToActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
  }
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b19/conservation");
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

describe("jup_b19_transfer_conserva_to_actor", () => {
  it("should give the conserva to the actor", () => {
    checkTransferToActor("jup_b19_transfer_conserva_to_actor", food.conserva);
  });
});

describe("jup_b19_reward", () => {
  it("should reveal the b19 treasure coordinates", () => {
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("jup_b19_reward");

    expect(giveTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_38");

    giveTreasureCoordinates.mockRestore();
  });
});
