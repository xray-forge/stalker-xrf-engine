import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/post_process/run_cam_effector");
});

beforeEach(() => {
  resetFunctionMock(level.add_cam_effector);
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
