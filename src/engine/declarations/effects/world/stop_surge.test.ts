import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/surge";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/stop_surge");
});

beforeEach(() => {
  resetRegistry();
});

describe("stop_surge", () => {
  it("should stop sounds", () => {
    const surgeManager: SurgeManager = getManager(SurgeManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(surgeManager, "requestSurgeStop").mockImplementation(jest.fn());

    callXrEffect("stop_surge", MockGameObject.mockActor(), object);

    expect(surgeManager.requestSurgeStop).toHaveBeenCalledTimes(1);
  });
});
