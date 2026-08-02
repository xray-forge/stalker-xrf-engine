import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { giveItemsToActor } from "@/engine/core/utils/reward";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/give_actor");
});

jest.mock("@/engine/core/utils/reward", () => ({
  giveItemsToActor: jest.fn(),
}));

beforeEach(() => {
  resetFunctionMock(giveItemsToActor);
});

describe("give_actor", () => {
  it("should give actor object list of items", () => {
    callXrEffect("give_actor", MockGameObject.mockActor(), MockGameObject.mock(), "first", "second");

    expect(giveItemsToActor).toHaveBeenCalledTimes(2);
    expect(giveItemsToActor).toHaveBeenCalledWith("first");
    expect(giveItemsToActor).toHaveBeenCalledWith("second");
  });
});
