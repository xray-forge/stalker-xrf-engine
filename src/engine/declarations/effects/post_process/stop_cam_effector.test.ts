import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/post_process/stop_cam_effector");
});

beforeEach(() => {
  resetFunctionMock(level.remove_cam_effector);
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
