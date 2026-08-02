import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/in_dest_smart_cover");
});

describe("in_dest_smart_cover", () => {
  it("should check if object is in smart cover", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => true);
    expect(callXrCondition("in_dest_smart_cover", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => false);
    expect(callXrCondition("in_dest_smart_cover", MockGameObject.mockActor(), object)).toBe(false);
  });
});
