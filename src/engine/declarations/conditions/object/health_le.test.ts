import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/health_le");
});

describe("health_le", () => {
  it("should check object health", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.5 });

    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.49)).toBe(false);
    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.5)).toBe(false);
    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.51)).toBe(true);
  });
});
