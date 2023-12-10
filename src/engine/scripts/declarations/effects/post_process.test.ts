import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { EScheme, GameObject } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

describe("post process effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/post_process");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("run_cam_effector");
    checkXrEffect("stop_cam_effector");
    checkXrEffect("run_cam_effector_global");
    checkXrEffect("cam_effector_callback");
    checkXrEffect("run_postprocess");
    checkXrEffect("stop_postprocess");
  });
});

describe("post process effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/post_process");
  });

  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(level.add_cam_effector);
    resetFunctionMock(level.add_cam_effector2);
    resetFunctionMock(level.remove_cam_effector);
    resetFunctionMock(level.add_complex_effector);
    resetFunctionMock(level.remove_complex_effector);
  });

  it("run_cam_effector should correctly add level effectors", () => {
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

  it("run_cam_effector_global should correctly add level effectors", () => {
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

  it("stop_cam_effector should correctly remove level effectors", () => {
    callXrEffect("stop_cam_effector", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.remove_cam_effector).toHaveBeenCalledTimes(0);

    callXrEffect("stop_cam_effector", MockGameObject.mockActor(), MockGameObject.mock(), 15);
    expect(level.remove_cam_effector).toHaveBeenCalledTimes(1);
    expect(level.remove_cam_effector).toHaveBeenCalledWith(15);
  });

  it("cam_effector_callback should correctly set signal after ending", () => {
    expect(() => {
      callXrEffect("cam_effector_callback", MockGameObject.mockActor(), MockGameObject.mock());
    }).not.toThrow();

    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.ANIMPOINT;
    state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT);

    callXrEffect("run_cam_effector", MockGameObject.mockActor(), object, "test-effector");

    expect(() => {
      callXrEffect("cam_effector_callback", MockGameObject.mockActor(), MockGameObject.mock());
    }).not.toThrow();
    expect(state[EScheme.ANIMPOINT]?.signals).toBeNull();

    state[EScheme.ANIMPOINT]!.signals = new LuaTable();

    expect(() => {
      callXrEffect("cam_effector_callback", MockGameObject.mockActor(), MockGameObject.mock());
    }).not.toThrow();
    expect(state[EScheme.ANIMPOINT]?.signals?.length()).toBe(1);
    expect(state[EScheme.ANIMPOINT]?.signals?.get("cameff_end")).toBe(true);
  });

  it("run_postprocess should correctly add complex effectors", () => {
    callXrEffect("run_postprocess", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.add_complex_effector).toHaveBeenCalledTimes(0);

    expect(() => {
      callXrEffect("run_postprocess", MockGameObject.mockActor(), MockGameObject.mock(), "not_existing");
    }).toThrow("Complex effector section does not exist in system ini: 'not_existing'.");
    expect(level.add_complex_effector).toHaveBeenCalledTimes(0);

    callXrEffect("run_postprocess", MockGameObject.mockActor(), MockGameObject.mock(), "existing");
    expect(level.add_complex_effector).toHaveBeenCalledTimes(1);
    expect(level.add_complex_effector).toHaveBeenCalledWith("existing", expect.any(Number));

    callXrEffect("run_postprocess", MockGameObject.mockActor(), MockGameObject.mock(), "existing", 55);
    expect(level.add_complex_effector).toHaveBeenCalledTimes(2);
    expect(level.add_complex_effector).toHaveBeenCalledWith("existing", 55);
  });

  it("stop_postprocess should correctly remove level effectors", () => {
    callXrEffect("stop_postprocess", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.remove_complex_effector).toHaveBeenCalledTimes(0);

    callXrEffect("stop_postprocess", MockGameObject.mockActor(), MockGameObject.mock(), 15);
    expect(level.remove_complex_effector).toHaveBeenCalledTimes(1);
    expect(level.remove_complex_effector).toHaveBeenCalledWith(15);
  });
});
