import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import { getManager } from "@/engine/core/database";
import { registerSimulationTerrain } from "@/engine/core/managers/simulation/utils";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { ESmartTerrainStatus, SmartTerrain, SmartTerrainControl } from "@/engine/core/objects/smart_terrain";
import { anomalyHasArtefact } from "@/engine/core/utils/anomaly";
import { GameObject } from "@/engine/lib/types";
import {
  callXrCondition,
  checkXrCondition,
  mockRegisteredActor,
  MockSmartTerrain,
  resetRegistry,
} from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/anomaly");

describe("world conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/world");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("is_rain");
    checkXrCondition("is_heavy_rain");
    checkXrCondition("is_day");
    checkXrCondition("is_dark_night");
    checkXrCondition("time_period");
    checkXrCondition("anomaly_has_artefact");
    checkXrCondition("surge_complete");
    checkXrCondition("surge_started");
    checkXrCondition("surge_kill_all");
    checkXrCondition("signal_rocket_flying");
    checkXrCondition("check_smart_alarm_status");
  });
});

describe("world conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/world");
  });

  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(anomalyHasArtefact);
  });

  it("talking should check if actor is talking", () => {
    jest.spyOn(level, "rain_factor").mockImplementation(() => 1);
    expect(callXrCondition("is_rain", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(level, "rain_factor").mockImplementation(() => -1);
    expect(callXrCondition("is_rain", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 0);
    expect(callXrCondition("is_rain", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 0.5);
    expect(callXrCondition("is_rain", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 1);
    expect(callXrCondition("is_rain", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("is_heavy_rain should check weather", () => {
    jest.spyOn(level, "rain_factor").mockImplementation(() => 1);
    expect(callXrCondition("is_heavy_rain", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(level, "rain_factor").mockImplementation(() => -1);
    expect(callXrCondition("is_heavy_rain", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 0);
    expect(callXrCondition("is_heavy_rain", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 0.45);
    expect(callXrCondition("is_heavy_rain", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 0.5);
    expect(callXrCondition("is_heavy_rain", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 1);
    expect(callXrCondition("is_heavy_rain", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("is_day should check time", () => {
    jest.spyOn(level, "get_time_hours").mockImplementation(() => 12);
    expect(callXrCondition("is_day", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 1);
    expect(callXrCondition("is_day", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 4);
    expect(callXrCondition("is_day", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 6);
    expect(callXrCondition("is_day", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 20);
    expect(callXrCondition("is_day", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 21);
    expect(callXrCondition("is_day", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 24);
    expect(callXrCondition("is_day", actorGameObject, MockGameObject.mock())).toBe(false);
  });

  it("is_dark_night should check weather", () => {
    jest.spyOn(level, "get_time_hours").mockImplementation(() => 12);
    expect(callXrCondition("is_dark_night", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 1);
    expect(callXrCondition("is_dark_night", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 2);
    expect(callXrCondition("is_dark_night", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 3);
    expect(callXrCondition("is_dark_night", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 16);
    expect(callXrCondition("is_dark_night", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 22);
    expect(callXrCondition("is_dark_night", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 23);
    expect(callXrCondition("is_dark_night", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("time_period should check time", () => {
    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 12);
    expect(callXrCondition("time_period", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 12);
    expect(callXrCondition("time_period", MockGameObject.mockActor(), MockGameObject.mock(), 10, 5)).toBe(false);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 12);
    expect(callXrCondition("time_period", MockGameObject.mockActor(), MockGameObject.mock(), 5, 10)).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 1);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 5, 4)).toBe(true);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 2)).toBe(true);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 1)).toBe(true);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 4);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 5, 4)).toBe(true);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 5, 2)).toBe(false);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 5, 1)).toBe(false);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 7);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 3)).toBe(true);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 2)).toBe(false);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 1)).toBe(false);
  });

  it("anomaly_has_artefact should check anomalies", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(anomalyHasArtefact, () => true);
    expect(callXrCondition("anomaly_has_artefact", actorGameObject, object, "anomaly-1", "artefact-1")).toBe(true);
    expect(anomalyHasArtefact).toHaveBeenCalledWith("anomaly-1", "artefact-1");

    replaceFunctionMock(anomalyHasArtefact, () => false);
    expect(
      callXrCondition("anomaly_has_artefact", actorGameObject, MockGameObject.mock(), "anomaly-2", "artefact-2")
    ).toBe(false);
    expect(anomalyHasArtefact).toHaveBeenCalledWith("anomaly-2", "artefact-2");
  });

  it("surge_complete should check surge state", () => {
    const { actorGameObject } = mockRegisteredActor();

    surgeConfig.IS_FINISHED = false;
    expect(callXrCondition("surge_complete", actorGameObject, MockGameObject.mock())).toBe(false);

    surgeConfig.IS_FINISHED = true;
    expect(callXrCondition("surge_complete", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("surge_started should check surge state", () => {
    const { actorGameObject } = mockRegisteredActor();

    surgeConfig.IS_STARTED = true;
    expect(callXrCondition("surge_started", actorGameObject, MockGameObject.mock())).toBe(true);

    surgeConfig.IS_STARTED = false;
    expect(callXrCondition("surge_started", actorGameObject, MockGameObject.mock())).toBe(false);
  });

  it("surge_kill_all should check surge state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: SurgeManager = getManager(SurgeManager);

    jest.spyOn(manager, "isKillingAll").mockImplementation(() => false);
    expect(callXrCondition("surge_kill_all", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(manager, "isKillingAll").mockImplementation(() => true);
    expect(callXrCondition("surge_kill_all", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("signal_rocket_flying should check surge signal rockets", () => {
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

  it("check_smart_alarm_status should check smart terrain alarm status", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    registerSimulationTerrain(terrain);

    expect(() => {
      return callXrCondition("check_smart_alarm_status", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("Wrong status 'nil' in 'check_smart_alarm_status' condition.");
    expect(() => {
      return callXrCondition(
        "check_smart_alarm_status",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "name",
        "not-existing"
      );
    }).toThrow("Wrong status 'nil' in 'check_smart_alarm_status' condition.");
    expect(() => {
      return callXrCondition(
        "check_smart_alarm_status",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "name",
        "alarm"
      );
    }).toThrow("Cannot calculate 'check_smart_alarm_status' for terrain 'name'.");

    terrain.terrainControl = new SmartTerrainControl(
      terrain,
      MockIniFile.mock("test.ltx", {
        test_section: {
          noweap_zone: "abc",
        },
      }),
      "test_section"
    );

    expect(
      callXrCondition(
        "check_smart_alarm_status",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        terrain.name(),
        "normal"
      )
    ).toBe(true);
    expect(
      callXrCondition(
        "check_smart_alarm_status",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        terrain.name(),
        "alarm"
      )
    ).toBe(false);

    terrain.terrainControl.status = ESmartTerrainStatus.ALARM;

    expect(
      callXrCondition(
        "check_smart_alarm_status",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        terrain.name(),
        "normal"
      )
    ).toBe(false);
    expect(
      callXrCondition(
        "check_smart_alarm_status",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        terrain.name(),
        "alarm"
      )
    ).toBe(true);
  });
});
