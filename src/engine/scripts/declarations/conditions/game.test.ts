import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game } from "xray16";

import { IBaseSchemeState, IRegistryObjectState, registerObject, setPortableStoreValue } from "@/engine/core/database";
import { isBlackScreen } from "@/engine/core/utils/game";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { EScheme, GameObject } from "@/engine/lib/types";
import {
  callXrCondition,
  checkXrCondition,
  mockRegisteredActor,
  mockSchemeState,
  resetRegistry,
} from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/game");

describe("game conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/game");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("signal");
    checkXrCondition("counter_greater");
    checkXrCondition("counter_equal");
    checkXrCondition("has_active_tutorial");
    checkXrCondition("black_screen");
  });
});

describe("game conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/game");
  });

  beforeEach(() => resetRegistry());

  it("signal should check if signal is active", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.WOUNDED, { signals: new LuaTable() });

    state.activeScheme = EScheme.WOUNDED;
    state[EScheme.WOUNDED] = schemeState;

    expect(callXrCondition("signal", MockGameObject.mockActor(), object, "some_signal")).toBe(false);

    schemeState.signals?.set("some_signal", true);
    expect(callXrCondition("signal", MockGameObject.mockActor(), object, "some_signal")).toBe(true);

    schemeState.signals?.set("some_signal", false);
    expect(callXrCondition("signal", MockGameObject.mockActor(), object, "some_signal")).toBe(false);

    schemeState.signals?.delete("some_signal");
    expect(callXrCondition("signal", MockGameObject.mockActor(), object, "some_signal")).toBe(false);
  });

  it("counter_greater should check counter value", () => {
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

  it("counter_equal should check counter value", () => {
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

  it("has_active_tutorial should check if any tutorial is active", () => {
    jest.spyOn(game, "has_active_tutorial").mockImplementationOnce(() => false);
    expect(callXrCondition("has_active_tutorial", MockGameObject.mock(), MockGameObject.mock())).toBe(false);

    jest.spyOn(game, "has_active_tutorial").mockImplementationOnce(() => true);
    expect(callXrCondition("has_active_tutorial", MockGameObject.mock(), MockGameObject.mock())).toBe(true);
  });

  it("black_screen should check if black screen is active", () => {
    replaceFunctionMock(isBlackScreen, () => false);
    expect(callXrCondition("black_screen", MockGameObject.mock(), MockGameObject.mock())).toBe(false);

    replaceFunctionMock(isBlackScreen, () => true);
    expect(callXrCondition("black_screen", MockGameObject.mock(), MockGameObject.mock())).toBe(true);
  });
});
