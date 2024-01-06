import { describe, expect, it } from "@jest/globals";

import { setObjectLookAtAnotherObject } from "@/engine/core/utils/object/object_set";
import { GameObject } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("setObjectLookAtAnotherObject util", () => {
  it("should correctly look at another object", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    setObjectLookAtAnotherObject(first, second);
    expect(first.set_sight).toHaveBeenNthCalledWith(1, 2, { x: 0, y: 0, z: 0 }, 0);

    replaceFunctionMock(first.position, () => MockVector.mock(16, 4, 2));
    replaceFunctionMock(second.position, () => MockVector.mock(2, 4, 16));

    setObjectLookAtAnotherObject(first, second);
    expect(first.set_sight).toHaveBeenNthCalledWith(2, 2, { x: -14, y: 0, z: 14 }, 0);
  });
});
