import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/game/signal");
});

describe("signal", () => {
  it("should check if signal is active", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      signals: new LuaTable(),
    });

    state.activeScheme = EScheme.WOUNDED;
    setSchemeState(state, EScheme.WOUNDED, schemeState);

    expect(callXrCondition("signal", MockGameObject.mockActor(), object, "some_signal")).toBe(false);

    schemeState.signals?.set("some_signal", true);
    expect(callXrCondition("signal", MockGameObject.mockActor(), object, "some_signal")).toBe(true);

    schemeState.signals?.set("some_signal", false);
    expect(callXrCondition("signal", MockGameObject.mockActor(), object, "some_signal")).toBe(false);

    schemeState.signals?.delete("some_signal");
    expect(callXrCondition("signal", MockGameObject.mockActor(), object, "some_signal")).toBe(false);
  });
});
