import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TRUE } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registerAnomalyZone } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/anomaly_turn_on");
});

beforeEach(() => {
  resetRegistry();
});

describe("anomaly_turn_on", () => {
  it("should turn on anomalies", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerAnomalyZone(zone);

    jest.spyOn(zone, "turnOn").mockImplementation(jest.fn());

    expect(() => {
      callXrEffect("anomaly_turn_on", MockGameObject.mockActor(), MockGameObject.mock(), "test-not-existing");
    }).toThrow("No anomaly zone with name 'test-not-existing' defined.");

    callXrEffect("anomaly_turn_on", MockGameObject.mockActor(), MockGameObject.mock(), zone.object.name());
    expect(zone.turnOn).toHaveBeenCalledTimes(1);
    expect(zone.turnOn).toHaveBeenCalledWith(false);

    callXrEffect("anomaly_turn_on", MockGameObject.mockActor(), MockGameObject.mock(), zone.object.name(), TRUE);
    expect(zone.turnOn).toHaveBeenCalledTimes(2);
    expect(zone.turnOn).toHaveBeenCalledWith(true);
  });
});
