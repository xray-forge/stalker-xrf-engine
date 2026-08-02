import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import { registerSignalLight } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/launch_signal_rocket");
});

beforeEach(() => {
  resetRegistry();
});

describe("launch_signal_rocket", () => {
  it("should launch signal rockets", () => {
    expect(() => {
      callXrEffect("launch_signal_rocket", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("No signal rocket with name 'nil' on current level.");

    const rocket: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    registerSignalLight(rocket);
    jest.spyOn(rocket, "startFly").mockImplementation(() => true);

    callXrEffect("launch_signal_rocket", MockGameObject.mockActor(), MockGameObject.mock(), rocket.object.name());
    expect(rocket.startFly).toHaveBeenCalledTimes(1);
  });
});
