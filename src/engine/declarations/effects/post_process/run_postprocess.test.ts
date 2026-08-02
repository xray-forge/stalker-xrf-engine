import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/post_process/run_postprocess");
});

beforeEach(() => {
  resetRegistry();
  resetFunctionMock(level.add_complex_effector);
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
