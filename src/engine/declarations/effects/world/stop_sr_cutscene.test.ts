import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrEffect, mockSchemeState, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/stop_sr_cutscene");
});

beforeEach(() => {
  resetRegistry();
});

describe("stop_sr_cutscene", () => {
  it("should stop cutscenes", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.ANIMPOINT;
    setSchemeState(
      state,
      EScheme.ANIMPOINT,
      mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, { signals: new LuaTable() })
    );

    callXrEffect("stop_sr_cutscene", MockGameObject.mockActor(), object);

    expect(getSchemeStateOptimistic(state, EScheme.ANIMPOINT).signals?.get("cam_effector_stop")).toBe(true);
  });
});
