import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMockOnce } from "xray16/testing/utils";

import { isObjectWounded } from "@/engine/core/utils/planner";
import { callXrCondition } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/planner");
beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_wounded");
});

describe("is_wounded", () => {
  it("should check if object is wounded", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMockOnce(isObjectWounded, () => true);
    expect(callXrCondition("is_wounded", MockGameObject.mockActor(), object)).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMockOnce(isObjectWounded, () => false);
    expect(callXrCondition("is_wounded", MockGameObject.mockActor(), object)).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
  });
});
