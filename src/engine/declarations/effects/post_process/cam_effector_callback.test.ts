import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrEffect, mockSchemeState, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/post_process/cam_effector_callback");
  require("@/engine/declarations/effects/post_process/run_cam_effector");
});

beforeEach(() => {
  resetRegistry();
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
