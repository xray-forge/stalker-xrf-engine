import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/heli_die");
});

beforeEach(() => {
  resetRegistry();
});

describe("heli_die", () => {
  it("should kill heli and remove it from the active helicopter list", () => {
    const object: GameObject = MockGameObject.mockHelicopter();

    registry.helicopter.storage.set(object.id(), object);

    callXrEffect("heli_die", MockGameObject.mockActor(), object);

    expect(object.get_helicopter().Die).toHaveBeenCalledTimes(1);
    expect(registry.helicopter.storage.has(object.id())).toBe(false);
  });
});
