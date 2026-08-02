import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/give_treasure");
});

beforeEach(() => {
  resetRegistry();
});

describe("give_treasure", () => {
  it("should give actor treasure coordinates", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callXrEffect("give_treasure", MockGameObject.mockActor(), MockGameObject.mock(), "first", "second", "third");

    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledTimes(3);
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("first");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("second");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("third");
  });
});
