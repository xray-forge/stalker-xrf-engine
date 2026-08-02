import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerSimulationTerrain } from "@/engine/core/managers/simulation/utils";
import { ESmartTerrainStatus, SmartTerrain, SmartTerrainControl } from "@/engine/core/objects/smart_terrain";
import { callXrCondition, MockSmartTerrain } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/world/check_smart_alarm_status");
});

describe("check_smart_alarm_status", () => {
  it("should check smart terrain alarm status", () => {
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
    }).toThrow("Wrong status 'not-existing' in 'check_smart_alarm_status' condition.");
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
