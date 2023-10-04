import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { disposeManager, getManagerInstance } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { IWeatherState } from "@/engine/core/managers/weather/weather_types";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { NIL } from "@/engine/lib/constants/words";
import { resetRegistry } from "@/fixtures/engine";
import { getFunctionMock } from "@/fixtures/jest";
import { mockLuaTable, MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("WeatherManager class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize and destroy", () => {
    const weatherManager: WeatherManager = getManagerInstance(WeatherManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(weatherManager.weatherPeriod).toBe("neutral");
    expect(weatherManager.lastUpdatedAtHour).toBe(0);
    expect(weatherManager.weatherFxTime).toBe(0);
    expect(eventsManager.getSubscribersCount()).toBe(2);

    disposeManager(WeatherManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle actor spawn", () => {
    const weatherManager: WeatherManager = getManagerInstance(WeatherManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    eventsManager.emitEvent(EGameEvent.ACTOR_GO_ONLINE);

    expect(level.name()).toBe("zaton");

    expect(weatherManager.weatherPeriod).toBe("neutral");
    expect(weatherManager.weatherSection).toBe("neutral");
    expect(String(getFunctionMock(level.set_weather).mock.calls[0][0]).startsWith("default_cloudy")).toBeTruthy();
  });

  it("should correctly set state", () => {
    const manager: WeatherManager = getManagerInstance(WeatherManager);

    manager.setStateAsString("dynamic_default=clear,cloudy");

    expect(MockLuaTable.getMockSize(manager.weatherState)).toBe(1);
    expect(manager.weatherState).toStrictEqual(
      mockLuaTable<string, IWeatherState>([
        [
          "dynamic_default",
          {
            currentState: "clear",
            weatherGraph: mockLuaTable([
              ["clear", 0.4],
              ["cloudy", 0.4],
              ["rain", 0.1],
              ["thunder", 0.1],
            ]),
            weatherName: "dynamic_default",
            nextState: "cloudy",
          },
        ],
      ])
    );
  });

  it("should correctly save and load data", () => {
    const manager: WeatherManager = getManagerInstance(WeatherManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    manager.setStateAsString("dynamic_default=clear,cloudy");
    manager.weatherSection = "test_weather";
    manager.weatherPeriod = "good";
    manager.weatherLastPeriodChangeHour = 9;
    manager.weatherNextPeriodChangeHour = 13;
    manager.lastUpdatedAtHour = 11;

    manager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.U32,
      EPacketDataType.U32,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["test_weather", "good", 9, 13, 11, "dynamic_default=clear,cloudy", NIL, 7]);

    disposeManager(WeatherManager);

    const newManager: WeatherManager = getManagerInstance(WeatherManager);

    newManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newManager).not.toBe(manager);
    expect(manager.weatherState).toEqual(newManager.weatherState);
    expect(manager.weatherFx).toEqual(newManager.weatherFx);
  });

  it.todo("should correctly handle period changes");

  it.todo("should correctly force weather change");

  it.todo("should correctly update weather");
});
