import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { disposeManager, getManagerInstance, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers";
import { IWeatherState, WeatherManager } from "@/engine/core/managers/world/WeatherManager";
import { NIL } from "@/engine/lib/constants/words";
import { mockLuaTable, MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { getFunctionMock } from "@/fixtures/utils";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("WeatherManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
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

    eventsManager.emitEvent(EGameEvent.ACTOR_NET_SPAWN);

    expect(level.name()).toBe("zaton");

    expect(weatherManager.weatherPeriod).toBe("neutral");
    expect(weatherManager.weatherSection).toBe("neutral");
    expect(String(getFunctionMock(level.set_weather).mock.calls[0][0]).startsWith("default_cloudy")).toBeTruthy();
  });

  it("should correctly set state", () => {
    const weatherManager: WeatherManager = getManagerInstance(WeatherManager);

    weatherManager.setStateAsString("dynamic_default=clear,cloudy");

    expect(MockLuaTable.getMockSize(weatherManager.weatherState)).toBe(1);
    expect(weatherManager.weatherState).toStrictEqual(
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
    const weatherManager: WeatherManager = getManagerInstance(WeatherManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    weatherManager.setStateAsString("dynamic_default=clear,cloudy");
    weatherManager.weatherSection = "test_weather";
    weatherManager.weatherPeriod = "good";
    weatherManager.weatherLastPeriodChangeHour = 9;
    weatherManager.weatherNextPeriodChangeHour = 13;
    weatherManager.lastUpdatedAtHour = 11;

    weatherManager.save(mockNetPacket(netProcessor));

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

    const newWeatherManager: WeatherManager = getManagerInstance(WeatherManager);

    newWeatherManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newWeatherManager).not.toBe(weatherManager);
    expect(weatherManager.weatherState).toEqual(newWeatherManager.weatherState);
    expect(weatherManager.weatherFx).toEqual(newWeatherManager.weatherFx);
  });
});
