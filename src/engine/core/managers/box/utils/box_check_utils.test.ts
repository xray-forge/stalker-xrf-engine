import { describe, expect, it, jest } from "@jest/globals";

import { BOX_METAL_01, BOX_WOOD_01, BOX_WOOD_02, isBoxObject } from "@/engine/core/managers/box";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("isBoxObject util", () => {
  it("should correctly check game objects", () => {
    const object: GameObject = MockGameObject.mock();

    expect(isBoxObject(object)).toBe(false);

    jest.spyOn(object, "get_visual_name").mockImplementation(() => BOX_WOOD_01);
    expect(isBoxObject(object)).toBe(true);

    jest.spyOn(object, "get_visual_name").mockImplementation(() => "test");
    expect(isBoxObject(object)).toBe(false);

    jest.spyOn(object, "get_visual_name").mockImplementation(() => BOX_WOOD_02);
    expect(isBoxObject(object)).toBe(true);

    jest.spyOn(object, "get_visual_name").mockImplementation(() => "test2");
    expect(isBoxObject(object)).toBe(true);

    jest.spyOn(object, "get_visual_name").mockImplementation(() => BOX_METAL_01);
    expect(isBoxObject(object)).toBe(true);
  });
});
