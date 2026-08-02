import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { FALSE, TRUE } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/sniper_fire_mode");
});

describe("sniper_fire_mode", () => {
  it("should set object as sniper", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("sniper_fire_mode", MockGameObject.mockActor(), object, TRUE);
    expect(object.sniper_fire_mode).toHaveBeenCalledWith(true);

    callXrEffect("sniper_fire_mode", MockGameObject.mockActor(), object, FALSE);
    expect(object.sniper_fire_mode).toHaveBeenCalledWith(false);
  });
});
