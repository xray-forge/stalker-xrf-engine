import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/burer_gravi_attack");
});

describe("burer_gravi_attack", () => {
  it("should check burer gravi attack", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "burer_get_force_gravi_attack").mockImplementation(() => true);
    expect(callXrCondition("burer_gravi_attack", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "burer_get_force_gravi_attack").mockImplementation(() => false);
    expect(callXrCondition("burer_gravi_attack", MockGameObject.mockActor(), object)).toBe(false);
  });
});
