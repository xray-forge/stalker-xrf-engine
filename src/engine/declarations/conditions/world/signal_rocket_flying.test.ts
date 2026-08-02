import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/world/signal_rocket_flying");
});

describe("signal_rocket_flying", () => {
  it("should check surge signal rockets", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    expect(() => {
      return callXrCondition("signal_rocket_flying", actorGameObject, MockGameObject.mock(), "test_rocket");
    }).toThrow("No such signal rocket: 'test_rocket' on the level.");

    expect(() => {
      return callXrCondition("signal_rocket_flying", actorGameObject, MockGameObject.mock());
    }).toThrow("No such signal rocket: 'nil' on the level.");

    jest.spyOn(object, "name").mockImplementation(() => "test_rocket");

    const binder: SignalLightBinder = new SignalLightBinder(object);

    binder.reinit();

    jest.spyOn(binder, "isFlying").mockImplementation(() => false);
    expect(callXrCondition("signal_rocket_flying", actorGameObject, MockGameObject.mock(), "test_rocket")).toBe(false);

    jest.spyOn(binder, "isFlying").mockImplementation(() => true);
    expect(callXrCondition("signal_rocket_flying", actorGameObject, MockGameObject.mock(), "test_rocket")).toBe(true);
  });
});
