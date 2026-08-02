import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/burer_anti_aim");
});

describe("burer_anti_aim", () => {
  it("should check burer anti aim", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_force_anti_aim").mockImplementation(() => true);
    expect(callXrCondition("burer_anti_aim", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "get_force_anti_aim").mockImplementation(() => false);
    expect(callXrCondition("burer_anti_aim", MockGameObject.mockActor(), object)).toBe(false);
  });
});
