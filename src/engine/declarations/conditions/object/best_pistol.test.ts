import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/best_pistol");
});

describe("best_pistol", () => {
  it("should check object has pistol", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "item_in_slot").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("best_pistol", MockGameObject.mockActor(), object)).toBe(true);
    expect(object.item_in_slot).toHaveBeenCalledWith(1);

    jest.spyOn(object, "item_in_slot").mockImplementation(() => null);
    expect(callXrCondition("best_pistol", MockGameObject.mockActor(), object)).toBe(false);
  });
});
