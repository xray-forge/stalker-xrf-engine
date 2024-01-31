import { describe, expect, it } from "@jest/globals";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme/AbstractSchemeManager";
import { IBaseSchemeState } from "@/engine/core/database";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("AbstractSchemeManager", () => {
  class ExampleManager extends AbstractSchemeManager<IBaseSchemeState> {}

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IBaseSchemeState = mockSchemeState(EScheme.HIT);
    const manager: ExampleManager = new ExampleManager(object, state);

    expect(manager.object).toBe(object);
    expect(manager.state).toBe(state);
  });

  it("base methods should be safe to call", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IBaseSchemeState = mockSchemeState(EScheme.HIT);
    const manager: ExampleManager = new ExampleManager(object, state);

    expect(() => manager.activate(MockGameObject.mock(), false)).not.toThrow();
    expect(() => manager.onSwitchOnline(MockGameObject.mock())).not.toThrow();
    expect(() => manager.onSwitchOffline(MockGameObject.mock())).not.toThrow();
    expect(() => manager.onHit(MockGameObject.mock(), 1, MockVector.mock(), null, 1)).not.toThrow();
    expect(() => manager.onUse(MockGameObject.mock(), null)).not.toThrow();
    expect(() => manager.onWaypoint(MockGameObject.mock(), "test", 1)).not.toThrow();
    expect(() => manager.onDeath(MockGameObject.mock(), null)).not.toThrow();
    expect(() => manager.onCutscene()).not.toThrow();
    expect(() => manager.onCombat()).not.toThrow();
  });
});
