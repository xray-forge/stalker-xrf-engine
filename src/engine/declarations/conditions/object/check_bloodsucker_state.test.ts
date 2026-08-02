import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/check_bloodsucker_state");
});

describe("check_bloodsucker_state", () => {
  it("should compare the resolved object visibility state", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_visibility_state").mockReturnValue(1);

    expect(callXrCondition("check_bloodsucker_state", MockGameObject.mockActor(), object, "1")).toBe(true);
    expect(callXrCondition("check_bloodsucker_state", MockGameObject.mockActor(), object, "0")).toBe(false);
  });
});
