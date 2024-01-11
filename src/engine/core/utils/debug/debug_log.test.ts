import { beforeEach, describe, expect, it } from "@jest/globals";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import {
  logObjectInventoryItems,
  logObjectPlannerState,
  logObjectRelations,
  logObjectState,
  logObjectStateManager,
} from "@/engine/core/utils/debug/debug_log";
import { GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("logObjectInventoryItems util", () => {
  it("should not throw", () => {
    expect(() => logObjectInventoryItems(MockGameObject.mock())).not.toThrow();
  });
});

describe("logObjectPlannerState util", () => {
  it("should not throw", () => {
    expect(() => logObjectPlannerState(MockGameObject.mock())).not.toThrow();
  });
});

describe("logObjectStateManager util", () => {
  it("should not throw", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.stateManager = new StalkerStateManager(object);

    expect(() => logObjectStateManager(MockGameObject.mock())).not.toThrow();
  });
});

describe("logObjectRelations util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should not throw", () => {
    expect(() => logObjectRelations(MockGameObject.mock())).not.toThrow();
  });
});

describe("logObjectState util", () => {
  it("should not throw", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => logObjectState(object)).not.toThrow();
  });
});
