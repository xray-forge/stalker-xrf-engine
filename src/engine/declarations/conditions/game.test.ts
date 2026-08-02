import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game } from "xray16";
import { GameObject } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { IRegistryObjectState, registerObject, setPortableStoreValue } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { isBlackScreen } from "@/engine/core/utils/game";
import { callXrCondition, mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/game");

beforeAll(() => {
  require("@/engine/declarations/conditions/game");
});

beforeEach(() => {
  resetRegistry();
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

describe("counter_greater", () => {
  it("should check counter value", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrCondition("counter_greater", actorGameObject, MockGameObject.mock())).toThrow(
      "Invalid parameters supplied for condition 'counter_greater'."
    );

    setPortableStoreValue(ACTOR_ID, "test_greater", 10);

    expect(callXrCondition("counter_greater", actorGameObject, MockGameObject.mock(), "test_greater", 9)).toBe(true);
    expect(callXrCondition("counter_greater", actorGameObject, MockGameObject.mock(), "test_greater", 10)).toBe(false);
    expect(callXrCondition("counter_greater", actorGameObject, MockGameObject.mock(), "test_greater", 11)).toBe(false);

    expect(callXrCondition("counter_greater", actorGameObject, MockGameObject.mock(), "test_unknown", 11)).toBe(false);
  });
});

describe("counter_equal", () => {
  it("should check counter value", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrCondition("counter_equal", actorGameObject, MockGameObject.mock())).toThrow(
      "Invalid parameters supplied for condition 'counter_equal'."
    );

    setPortableStoreValue(ACTOR_ID, "test_one", 1);
    setPortableStoreValue(ACTOR_ID, "test_two", 2);

    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_one", 1)).toBe(true);
    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_one", 2)).toBe(false);

    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_two", 1)).toBe(false);
    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_two", 2)).toBe(true);

    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_three", 10)).toBe(false);
  });
});

describe("has_active_tutorial", () => {
  it("should check if any tutorial is active", () => {
    jest.spyOn(game, "has_active_tutorial").mockImplementationOnce(() => false);
    expect(callXrCondition("has_active_tutorial", MockGameObject.mock(), MockGameObject.mock())).toBe(false);

    jest.spyOn(game, "has_active_tutorial").mockImplementationOnce(() => true);
    expect(callXrCondition("has_active_tutorial", MockGameObject.mock(), MockGameObject.mock())).toBe(true);
  });
});

describe("black_screen", () => {
  it("should check if black screen is active", () => {
    replaceFunctionMock(isBlackScreen, () => false);
    expect(callXrCondition("black_screen", MockGameObject.mock(), MockGameObject.mock())).toBe(false);

    replaceFunctionMock(isBlackScreen, () => true);
    expect(callXrCondition("black_screen", MockGameObject.mock(), MockGameObject.mock())).toBe(true);
  });
});
