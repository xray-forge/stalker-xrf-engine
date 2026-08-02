import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registerAnomalyZone } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/anomaly_turn_off");
});

beforeEach(() => {
  resetRegistry();
});

describe("anomaly_turn_off", () => {
  it("should turn off anomalies", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerAnomalyZone(zone);

    jest.spyOn(zone, "turnOff").mockImplementation(jest.fn());

    expect(() => {
      callXrEffect("anomaly_turn_off", MockGameObject.mockActor(), MockGameObject.mock(), "test-not-existing");
    }).toThrow("No anomaly zone with name 'test-not-existing' defined.");

    callXrEffect("anomaly_turn_off", MockGameObject.mockActor(), MockGameObject.mock(), zone.object.name());
    expect(zone.turnOff).toHaveBeenCalled();
  });
});
