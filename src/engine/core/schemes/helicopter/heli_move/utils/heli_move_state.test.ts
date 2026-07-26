import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move";
import { HelicopterFireController } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { HelicopterFlyController } from "@/engine/core/schemes/helicopter/heli_move/fly";
import {
  getHelicopterFireController,
  getHelicopterFlyController,
} from "@/engine/core/schemes/helicopter/heli_move/utils/heli_move_state";

describe("getHelicopterFireController", () => {
  beforeEach(() => {
    helicopterConfig.HELICOPTER_FIRE_MANAGERS = new LuaTable();
  });

  it("should correctly handle singletons", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: HelicopterFireController = getHelicopterFireController(object);

    expect(helicopterConfig.HELICOPTER_FIRE_MANAGERS.length()).toBe(1);
    expect(controller).toBe(getHelicopterFireController(object));
  });
});

describe("getHelicopterFlyController", () => {
  beforeEach(() => {
    helicopterConfig.HELICOPTER_FLY_MANAGERS = new LuaTable();
  });

  it("should correctly handle singletons", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: HelicopterFlyController = getHelicopterFlyController(object);

    expect(helicopterConfig.HELICOPTER_FLY_MANAGERS.length()).toBe(1);
    expect(controller).toBe(getHelicopterFlyController(object));
  });
});
