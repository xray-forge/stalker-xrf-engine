import { describe, expect, it, jest } from "@jest/globals";
import { CTime, game } from "xray16";

import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { startTerrainAlarm, updateTerrainAlarmStatus } from "@/engine/core/utils/smart_terrain/smart_terrain_alarms";
import { MockSmartTerrain } from "@/fixtures/engine";
import { MockCTime } from "@/fixtures/xray";

describe("startSmartTerrainAlarm util", () => {
  it("should correctly start alarm", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const nowTime: CTime = MockCTime.mock(2015, 6, 14, 13, 25, 30, 500);
    const laterTime: CTime = MockCTime.mock(2015, 6, 15, 13, 25, 30, 500);

    expect(terrain.alarmStartedAt).toBeNull();

    jest.spyOn(game, "get_game_time").mockImplementation(() => nowTime);
    startTerrainAlarm(terrain);
    expect(terrain.alarmStartedAt).toBe(nowTime);

    jest.spyOn(game, "get_game_time").mockImplementation(() => laterTime);
    startTerrainAlarm(terrain);
    expect(terrain.alarmStartedAt).toBe(laterTime);
  });
});

describe("updateSmartTerrainAlarmStatus util", () => {
  it("should correctly handle alarm", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const startTime: CTime = MockCTime.mock(2015, 6, 14, 12, 25, 30, 500);
    const laterTime: CTime = MockCTime.mock(2015, 6, 14, 15, 25, 30, 500);
    const endedTime: CTime = MockCTime.mock(2015, 6, 14, 18, 25, 30, 500); // Exactly 6 hours.

    expect(terrain.alarmStartedAt).toBeNull();

    jest.spyOn(game, "get_game_time").mockImplementation(() => startTime);
    startTerrainAlarm(terrain);
    updateTerrainAlarmStatus(terrain);
    expect(terrain.alarmStartedAt).toBe(startTime);

    jest.spyOn(game, "get_game_time").mockImplementation(() => laterTime);
    updateTerrainAlarmStatus(terrain);
    expect(terrain.alarmStartedAt).toBe(startTime);

    jest.spyOn(game, "get_game_time").mockImplementation(() => endedTime);
    updateTerrainAlarmStatus(terrain);
    expect(terrain.alarmStartedAt).toBeNull();
  });
});
