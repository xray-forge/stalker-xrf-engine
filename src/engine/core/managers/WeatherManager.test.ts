import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance, registry } from "@/engine/core/database";
import { EventsManager, IWeatherState, WeatherManager } from "@/engine/core/managers";
import { NIL } from "@/engine/lib/constants/words";
import { mockLuaTable, MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("WeatherManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly initialize and destroy", () => {
    const weatherManager: WeatherManager = getManagerInstance(WeatherManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(weatherManager.last_hour).toBe(0);
    expect(weatherManager.wfx_time).toBe(0);
    expect(eventsManager.getSubscribersCount()).toBe(2);

    disposeManager(WeatherManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly set state", () => {
    const weatherManager: WeatherManager = getManagerInstance(WeatherManager);

    weatherManager.setStateAsString("dynamic_default=clear,cloudy");

    expect(MockLuaTable.getMockSize(weatherManager.state)).toBe(1);
    expect(weatherManager.state).toStrictEqual(
      mockLuaTable<string, IWeatherState>([
        [
          "dynamic_default",
          {
            current_state: "clear",
            graph: mockLuaTable([
              ["clear", 0.4],
              ["cloudy", 0.4],
              ["rain", 0.1],
              ["thunder", 0.1],
            ]),
            graph_name: "dynamic_default",
            next_state: "cloudy",
          },
        ],
      ])
    );
  });

  it("should correctly save and load data", () => {
    const weatherManager: WeatherManager = getManagerInstance(WeatherManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    weatherManager.setStateAsString("dynamic_default=clear,cloudy");
    weatherManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.STRING, EPacketDataType.STRING, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual(["dynamic_default=clear,cloudy", NIL, 2]);

    disposeManager(WeatherManager);

    const newWeatherManager: WeatherManager = getManagerInstance(WeatherManager);

    newWeatherManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.STRING, EPacketDataType.STRING, EPacketDataType.U16]);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newWeatherManager).not.toBe(weatherManager);
    expect(weatherManager.state).toEqual(newWeatherManager.state);
    expect(weatherManager.weather_fx).toEqual(newWeatherManager.weather_fx);
  });
});
