import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/surge";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/start_surge");
});

beforeEach(() => {
  resetRegistry();
});

describe("start_surge", () => {
  it("should stop sounds", () => {
    const surgeManager: SurgeManager = getManager(SurgeManager);
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(surgeManager, "requestSurgeStart").mockImplementation(jest.fn());

    callXrEffect("start_surge", MockGameObject.mockActor(), object);

    expect(surgeManager.requestSurgeStart).toHaveBeenCalledTimes(1);
  });
});
