import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrEffect, mockSchemeState, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/post_process");
});

beforeEach(() => {
  resetRegistry();

  resetFunctionMock(level.add_cam_effector);
  resetFunctionMock(level.add_cam_effector2);
  resetFunctionMock(level.remove_cam_effector);
  resetFunctionMock(level.add_complex_effector);
  resetFunctionMock(level.remove_complex_effector);
});

describe("run_cam_effector", () => {
  it("should correctly add level effectors", () => {
    callXrEffect("run_cam_effector", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.add_cam_effector).toHaveBeenCalledTimes(0);

    callXrEffect("run_cam_effector", MockGameObject.mockActor(), MockGameObject.mock(), "test_effect_1");
    expect(level.add_cam_effector).toHaveBeenCalledTimes(1);
    expect(level.add_cam_effector).toHaveBeenCalledWith(
      "camera_effects\\test_effect_1.anm",
      expect.any(Number),
      false,
      "xr_effects.cam_effector_callback"
    );

    callXrEffect("run_cam_effector", MockGameObject.mockActor(), MockGameObject.mock(), "test_effect_2", 450);
    expect(level.add_cam_effector).toHaveBeenCalledWith(
      "camera_effects\\test_effect_2.anm",
      450,
      false,
      "xr_effects.cam_effector_callback"
    );

    callXrEffect("run_cam_effector", MockGameObject.mockActor(), MockGameObject.mock(), "test_effect_3", 500, "true");
    expect(level.add_cam_effector).toHaveBeenCalledWith(
      "camera_effects\\test_effect_3.anm",
      500,
      true,
      "xr_effects.cam_effector_callback"
    );
  });
});

describe("run_cam_effector_global", () => {
  it("should correctly add level effectors", () => {
    callXrEffect("run_cam_effector_global", MockGameObject.mockActor(), MockGameObject.mock(), "test_effect_1");
    expect(level.add_cam_effector2).toHaveBeenCalledTimes(1);
    expect(level.add_cam_effector2).toHaveBeenCalledWith(
      "camera_effects\\test_effect_1.anm",
      expect.any(Number),
      false,
      "xr_effects.cam_effector_callback",
      70
    );

    callXrEffect("run_cam_effector_global", MockGameObject.mockActor(), MockGameObject.mock(), "test_effect_2", 450);
    expect(level.add_cam_effector2).toHaveBeenCalledWith(
      "camera_effects\\test_effect_2.anm",
      450,
      false,
      "xr_effects.cam_effector_callback",
      70
    );

    callXrEffect(
      "run_cam_effector_global",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test_effect_3",
      500,
      90
    );
    expect(level.add_cam_effector2).toHaveBeenCalledWith(
      "camera_effects\\test_effect_3.anm",
      500,
      false,
      "xr_effects.cam_effector_callback",
      90
    );
  });
});

describe("stop_cam_effector", () => {
  it("should correctly remove level effectors", () => {
    callXrEffect("stop_cam_effector", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.remove_cam_effector).toHaveBeenCalledTimes(0);

    callXrEffect("stop_cam_effector", MockGameObject.mockActor(), MockGameObject.mock(), 15);
    expect(level.remove_cam_effector).toHaveBeenCalledTimes(1);
    expect(level.remove_cam_effector).toHaveBeenCalledWith(15);
  });
});

describe("cam_effector_callback", () => {
  it("should correctly set signal after ending", () => {
    expect(() => {
      callXrEffect("cam_effector_callback", MockGameObject.mockActor(), MockGameObject.mock());
    }).not.toThrow();

    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(state, EScheme.ANIMPOINT, mockSchemeState(EScheme.ANIMPOINT));

    callXrEffect("run_cam_effector", MockGameObject.mockActor(), object, "test-effector");

    expect(() => {
      callXrEffect("cam_effector_callback", MockGameObject.mockActor(), MockGameObject.mock());
    }).not.toThrow();
    expect(getSchemeStateOptimistic(state, EScheme.ANIMPOINT).signals).toBeNull();

    getSchemeStateOptimistic(state, EScheme.ANIMPOINT).signals = new LuaTable();

    expect(() => {
      callXrEffect("cam_effector_callback", MockGameObject.mockActor(), MockGameObject.mock());
    }).not.toThrow();
    expect(getSchemeStateOptimistic(state, EScheme.ANIMPOINT).signals?.length()).toBe(1);
    expect(getSchemeStateOptimistic(state, EScheme.ANIMPOINT).signals?.get("cameff_end")).toBe(true);
  });
});

describe("run_postprocess", () => {
  it("should correctly add complex effectors", () => {
    callXrEffect("run_postprocess", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.add_complex_effector).toHaveBeenCalledTimes(0);

    expect(() => {
      callXrEffect("run_postprocess", MockGameObject.mockActor(), MockGameObject.mock(), "not_existing");
    }).toThrow("Complex effector section does not exist in system ini: 'not_existing'.");
    expect(level.add_complex_effector).toHaveBeenCalledTimes(0);

    callXrEffect("run_postprocess", MockGameObject.mockActor(), MockGameObject.mock(), "bobbing_effector");
    expect(level.add_complex_effector).toHaveBeenCalledTimes(1);
    expect(level.add_complex_effector).toHaveBeenCalledWith("bobbing_effector", expect.any(Number));

    callXrEffect("run_postprocess", MockGameObject.mockActor(), MockGameObject.mock(), "bobbing_effector", 55);
    expect(level.add_complex_effector).toHaveBeenCalledTimes(2);
    expect(level.add_complex_effector).toHaveBeenCalledWith("bobbing_effector", 55);
  });
});

describe("stop_postprocess", () => {
  it("should correctly remove level effectors", () => {
    callXrEffect("stop_postprocess", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.remove_complex_effector).toHaveBeenCalledTimes(0);

    callXrEffect("stop_postprocess", MockGameObject.mockActor(), MockGameObject.mock(), 15);
    expect(level.remove_complex_effector).toHaveBeenCalledTimes(1);
    expect(level.remove_complex_effector).toHaveBeenCalledWith(15);
  });
});
