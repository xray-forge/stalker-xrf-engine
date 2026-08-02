import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/burer_force_anti_aim");
});

describe("burer_force_anti_aim", () => {
  it("should force attack reset", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "set_force_anti_aim").mockImplementation(jest.fn());

    callXrEffect("burer_force_anti_aim", MockGameObject.mockActor(), object);

    expect(object.set_force_anti_aim).toHaveBeenCalledTimes(1);
    expect(object.set_force_anti_aim).toHaveBeenCalledWith(true);
  });
});
