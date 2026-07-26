import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockVector } from "xray16/mocks";

import { AbstractSchemeController } from "@/engine/core/schemes/base/AbstractSchemeController";
import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

describe("AbstractSchemeController", () => {
  class ExampleController extends AbstractSchemeController<IBaseSchemeState> {}

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IBaseSchemeState = mockSchemeState(EScheme.HIT);
    const controller: ExampleController = new ExampleController(object, state);

    expect(controller.object).toBe(object);
    expect(controller.state).toBe(state);
  });

  it("base methods should be safe to call", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IBaseSchemeState = mockSchemeState(EScheme.HIT);
    const controller: ExampleController = new ExampleController(object, state);

    expect(() => controller.activate(MockGameObject.mock(), false)).not.toThrow();
    expect(() => controller.onSwitchOnline(MockGameObject.mock())).not.toThrow();
    expect(() => controller.onSwitchOffline(MockGameObject.mock())).not.toThrow();
    expect(() => controller.onHit(MockGameObject.mock(), 1, MockVector.mock(), null, 1)).not.toThrow();
    expect(() => controller.onUse(MockGameObject.mock(), null)).not.toThrow();
    expect(() => controller.onWaypoint(MockGameObject.mock(), "test", 1)).not.toThrow();
    expect(() => controller.onDeath(MockGameObject.mock(), null)).not.toThrow();
    expect(() => controller.onCutscene()).not.toThrow();
    expect(() => controller.onCombat()).not.toThrow();
  });
});
