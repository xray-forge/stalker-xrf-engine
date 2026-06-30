import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { IStateDescriptor } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { getObjectSmartCoverStateQueueParams } from "@/engine/core/utils/smart_cover";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("getObjectSmartCoverStateQueueParams", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly generate smart cover queue params", () => {
    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    const descriptor: IStateDescriptor = {
      animstate: null,
      animation: "barricade_0_attack",
      bodystate: null,
      mental: null,
      movement: null,
      weapon: null,
    };

    state.old_aim_time = null;

    jest.spyOn(object, "best_weapon").mockImplementation(() => weapon);
    jest.spyOn(object, "aim_time").mockImplementation((_targetWeapon, aimTime) => aimTime ?? 450);

    expect(getObjectSmartCoverStateQueueParams(object, descriptor)).toEqual([5, 300]);
    expect(object.aim_time).toHaveBeenNthCalledWith(1, weapon);
    expect(object.aim_time).toHaveBeenNthCalledWith(2, weapon, 0);
    expect(object.aim_time).toHaveBeenNthCalledWith(3, weapon, 450);
    expect(state.old_aim_time).toBeNull();
  });

  it("should correctly generate default queue params for unknown animations", () => {
    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mock();
    const descriptor: IStateDescriptor = {
      animstate: null,
      animation: "unknown_animation",
      bodystate: null,
      mental: null,
      movement: null,
      weapon: null,
    };
    const state: IRegistryObjectState = registerObject(object);

    state.old_aim_time = null;

    jest.spyOn(object, "best_weapon").mockImplementation(() => weapon);
    jest.spyOn(object, "aim_time");

    expect(getObjectSmartCoverStateQueueParams(object, descriptor)).toEqual([3, 1000]);
    expect(object.aim_time).not.toHaveBeenCalled();
    expect(state.old_aim_time).toBeNull();
  });

  it("should correctly restore stale aim time for unknown animations", () => {
    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    const descriptor: IStateDescriptor = {
      animstate: null,
      animation: "unknown_animation",
      bodystate: null,
      mental: null,
      movement: null,
      weapon: null,
    };

    state.old_aim_time = 750;

    jest.spyOn(object, "best_weapon").mockImplementation(() => weapon);
    jest.spyOn(object, "aim_time");

    expect(getObjectSmartCoverStateQueueParams(object, descriptor)).toEqual([3, 1000]);
    expect(object.aim_time).toHaveBeenCalledWith(weapon, 750);
    expect(state.old_aim_time).toBeNull();
  });
});
