import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/set_visual_memory_enabled");
});

describe("set_visual_memory_enabled", () => {
  it("should toggle visual memory for valid boolean values", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, 1);
    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, 0);

    expect(object.set_visual_memory_enabled).toHaveBeenCalledWith(true);
    expect(object.set_visual_memory_enabled).toHaveBeenCalledWith(false);
  });

  it("should ignore values outside the supported range", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, 2);
    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, -1);

    expect(object.set_visual_memory_enabled).not.toHaveBeenCalled();
  });
});
