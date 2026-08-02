import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { isDeimosPhaseActive } from "@/engine/core/schemes/restrictor/sr_deimos";
import { callXrCondition } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/restrictor/sr_deimos");
beforeEach(() => {
  resetFunctionMock(isDeimosPhaseActive);
});
beforeAll(() => {
  require("@/engine/declarations/conditions/object/check_deimos_phase");
});

describe("check_deimos_phase", () => {
  it("should check deimos phase", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(isDeimosPhaseActive, () => false);

    expect(callXrCondition("check_deimos_phase", MockGameObject.mockActor(), object)).toBe(false);
    expect(isDeimosPhaseActive).toHaveBeenCalledTimes(0);

    expect(callXrCondition("check_deimos_phase", MockGameObject.mockActor(), object, "disable_bound")).toBe(false);
    expect(isDeimosPhaseActive).toHaveBeenCalledTimes(0);

    expect(
      callXrCondition("check_deimos_phase", MockGameObject.mockActor(), object, "disable_bound", "increasing")
    ).toBe(false);
    expect(isDeimosPhaseActive).toHaveBeenCalledTimes(1);
    expect(isDeimosPhaseActive).toHaveBeenCalledWith(object, "disable_bound", true);

    replaceFunctionMock(isDeimosPhaseActive, () => true);

    expect(callXrCondition("check_deimos_phase", MockGameObject.mockActor(), object, "lower_bound", "decreasing")).toBe(
      true
    );
    expect(isDeimosPhaseActive).toHaveBeenCalledTimes(2);
    expect(isDeimosPhaseActive).toHaveBeenCalledWith(object, "lower_bound", false);
  });
});
