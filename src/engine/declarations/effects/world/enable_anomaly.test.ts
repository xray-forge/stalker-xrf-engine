import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/enable_anomaly");
});

beforeEach(() => {
  resetRegistry();
});

describe("enable_anomaly", () => {
  it("should enable anomalies", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "test-sid");

    expect(() => {
      callXrEffect("enable_anomaly", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("Story id for 'enable_anomaly' effect is not provided.");

    expect(() => {
      callXrEffect("enable_anomaly", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-not-existing");
    }).toThrow("There is no anomaly with story id 'test-sid-not-existing'.");

    callXrEffect("enable_anomaly", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");
    expect(object.enable_anomaly).toHaveBeenCalledTimes(1);
  });
});
