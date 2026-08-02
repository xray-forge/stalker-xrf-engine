import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/npc_has_item");
});

describe("npc_has_item", () => {
  it("should check if object has item", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("npc_has_item", MockGameObject.mockActor(), object, "test-section")).toBe(false);

    jest.spyOn(object, "object").mockImplementation(() => MockGameObject.mock());

    expect(callXrCondition("npc_has_item", MockGameObject.mockActor(), object, "test-section")).toBe(true);
    expect(object.object).toHaveBeenCalledWith("test-section");
  });
});
