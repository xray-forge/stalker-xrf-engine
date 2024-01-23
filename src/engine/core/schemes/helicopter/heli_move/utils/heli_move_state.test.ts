import { beforeEach, describe, expect, it } from "@jest/globals";

import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move";
import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { HelicopterFlyManager } from "@/engine/core/schemes/helicopter/heli_move/fly";
import {
  getHelicopterFireManager,
  getHelicopterFlyManager,
} from "@/engine/core/schemes/helicopter/heli_move/utils/heli_move_state";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("getHelicopterFireManager", () => {
  beforeEach(() => {
    helicopterConfig.HELICOPTER_FIRE_MANAGERS = new LuaTable();
  });

  it("should correctly handle singletons", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: HelicopterFireManager = getHelicopterFireManager(object);

    expect(helicopterConfig.HELICOPTER_FIRE_MANAGERS.length()).toBe(1);
    expect(manager).toBe(getHelicopterFireManager(object));
  });
});

describe("getHelicopterFlyManager", () => {
  beforeEach(() => {
    helicopterConfig.HELICOPTER_FLY_MANAGERS = new LuaTable();
  });

  it("should correctly handle singletons", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: HelicopterFlyManager = getHelicopterFlyManager(object);

    expect(helicopterConfig.HELICOPTER_FLY_MANAGERS.length()).toBe(1);
    expect(manager).toBe(getHelicopterFlyManager(object));
  });
});
