import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/see_enemy");
});

describe("see_enemy", () => {
  it("should check if object see enemy", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(false);
  });
});
