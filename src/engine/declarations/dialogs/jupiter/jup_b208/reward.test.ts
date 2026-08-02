import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { resetFunctionMock } from "xray16/testing/utils";

import { getManager } from "@/engine/core/database";
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

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b208/reward");
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

describe("jup_b208_give_reward", () => {
  it("should grant money and all three treasure coordinates", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callDialogsBinding("jup_b208_give_reward");

    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_18");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_35");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_45");
  });
});
