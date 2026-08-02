import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/burer_force_gravi_attack");
});

describe("burer_force_gravi_attack", () => {
  it("should force burrer attack", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "burer_set_force_gravi_attack").mockImplementation(jest.fn());

    callXrEffect("burer_force_gravi_attack", MockGameObject.mockActor(), object);

    expect(object.burer_set_force_gravi_attack).toHaveBeenCalledTimes(1);
    expect(object.burer_set_force_gravi_attack).toHaveBeenCalledWith(true);
  });
});
