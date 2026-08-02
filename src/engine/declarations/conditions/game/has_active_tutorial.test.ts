import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { game } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/game/has_active_tutorial");
});

describe("has_active_tutorial", () => {
  it("should check if any tutorial is active", () => {
    jest.spyOn(game, "has_active_tutorial").mockImplementationOnce(() => false);
    expect(callXrCondition("has_active_tutorial", MockGameObject.mock(), MockGameObject.mock())).toBe(false);

    jest.spyOn(game, "has_active_tutorial").mockImplementationOnce(() => true);
    expect(callXrCondition("has_active_tutorial", MockGameObject.mock(), MockGameObject.mock())).toBe(true);
  });
});
