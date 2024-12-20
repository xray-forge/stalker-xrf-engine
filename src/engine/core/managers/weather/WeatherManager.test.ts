import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { EWeatherPeriodType, IWeatherState } from "@/engine/core/managers/weather/weather_types";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { NIL } from "@/engine/lib/constants/words";
import { resetRegistry } from "@/fixtures/engine";
import { getFunctionMock } from "@/fixtures/jest";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { EPacketDataType, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("WeatherManager", () => {
  beforeEach(() => {
    resetRegistry();

    weatherConfig.IS_UNDERGROUND_WEATHER = false;
  });

  it("should correctly initialize and destroy", () => {
    const weatherManager: WeatherManager = getManager(WeatherManager);
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(weatherManager.weatherPeriod).toBe("good");
    expect(weatherManager.lastUpdatedAtHour).toBe(0);
    expect(weatherManager.weatherFxTime).toBe(0);
    expect(eventsManager.getSubscribersCount()).toBe(2);

    disposeManager(WeatherManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle actor spawn", () => {
    const manager: WeatherManager = getManager(WeatherManager);
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.emitEvent(EGameEvent.ACTOR_GO_ONLINE);

    jest.spyOn(level, "name").mockImplementation(() => "zaton");

    expect(level.name()).toBe("zaton");
    expect(weatherConfig.IS_UNDERGROUND_WEATHER).toBe(false);
    expect(manager.weatherPeriod).toBe("good");
    expect(manager.weatherSection).toBe("atmosfear_clear_foggy");
    expect(String(getFunctionMock(level.set_weather).mock.calls[0][0]).startsWith("af3_slight_")).toBeTruthy();

    jest.spyOn(level, "name").mockImplementation(() => "jupiter_underground");

    expect(level.name()).toBe("jupiter_underground");
    expect(weatherConfig.IS_UNDERGROUND_WEATHER).toBe(false);

    jest.spyOn(level, "name").mockImplementation(() => "zaton");
  });

  it("should correctly set state", () => {
    const manager: WeatherManager = getManager(WeatherManager);

    manager.setStateAsString("dynamic_default=clear,cloudy");

    expect(MockLuaTable.getMockSize(manager.weatherState)).toBe(1);
    expect(manager.weatherState).toEqualLuaTables(
      MockLuaTable.mock<string, IWeatherState>([
        [
          "dynamic_default",
          {
            currentState: "clear",
            weatherGraph: MockLuaTable.mock([
              ["clear", 0.2],
              ["cloudy", 0.2],
              ["foggy", 0.1],
              ["partly", 0.2],
              ["rain", 0.1],
              ["thunder", 0.1],
              ["veryfoggy", 0.1],
            ]),
            weatherName: "dynamic_default",
            nextState: "cloudy",
          },
        ],
      ])
    );
  });

  it("should correctly save and load data", () => {
    const manager: WeatherManager = getManager(WeatherManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    manager.setStateAsString("dynamic_default=clear,cloudy");
    manager.weatherSection = "test_weather";
    manager.weatherPeriod = EWeatherPeriodType.GOOD;
    manager.weatherLastPeriodChangeHour = 9;
    manager.weatherNextPeriodChangeHour = 13;
    manager.lastUpdatedAtHour = 11;

    manager.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.U32,
      EPacketDataType.U32,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual(["test_weather", "good", 9, 13, 11, "dynamic_default=clear,cloudy", NIL, 7]);

    disposeManager(WeatherManager);

    const newManager: WeatherManager = getManager(WeatherManager);

    newManager.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
    expect(newManager).not.toBe(manager);
    expect(manager.weatherState).toEqual(newManager.weatherState);
    expect(manager.weatherFx).toEqual(newManager.weatherFx);
  });

  it.todo("should correctly handle period changes");

  it.todo("should correctly force weather change");

  it.todo("should correctly update weather");
});
