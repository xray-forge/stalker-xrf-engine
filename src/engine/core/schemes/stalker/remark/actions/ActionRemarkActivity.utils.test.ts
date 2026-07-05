import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";

import { initTarget } from "@/engine/core/schemes/stalker/remark/actions";
import { MockGameObject } from "@/fixtures/xray";

describe("initTarget", () => {
  it("should resolve a numeric path point, keeping point 0", () => {
    const object: GameObject = MockGameObject.mock();

    const [position, , isInitialized] = initTarget(object, "path|test-wp,0");

    expect(isInitialized).toBe(true);
    expect(position).not.toBeNull();

    const [, , isInitializedSecond] = initTarget(object, "path|test-wp,2");

    expect(isInitializedSecond).toBe(true);
  });

  it("should skip a non-numeric path point without crashing", () => {
    const object: GameObject = MockGameObject.mock();

    const [position, id, isInitialized] = initTarget(object, "path|test-wp,abc");

    expect(isInitialized).toBe(false);
    expect(position).toBeNull();
    expect(id).toBeNull();
  });
});
