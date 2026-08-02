import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter } from "xray16";
import { GameObject } from "xray16/alias";
import { MockCHelicopter, MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/heli_health_le");
});

describe("heli_health_le", () => {
  it("should check heli health", () => {
    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    helicopter.SetfHealth(0.5);

    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.49)).toBe(false);
    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.5)).toBe(false);
    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.51)).toBe(true);
  });
});
