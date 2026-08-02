import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/disable_memory_object");
});

describe("disable_memory_object", () => {
  it("should disable memory for the current best enemy", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();

    jest.spyOn(object, "best_enemy").mockReturnValue(enemy);

    callXrEffect("disable_memory_object", MockGameObject.mockActor(), object);

    jest.spyOn(object, "best_enemy").mockReturnValue(null);

    callXrEffect("disable_memory_object", MockGameObject.mockActor(), object);

    expect(object.enable_memory_object).toHaveBeenCalledWith(enemy, false);
    expect(object.enable_memory_object).toHaveBeenCalledTimes(1);
  });
});
