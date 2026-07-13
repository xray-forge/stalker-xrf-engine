import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { AnyObject, NIL, TName, TProbability } from "xray16/lib";
import { $fromObject } from "xray16/macros";
import { EMockPacketDataType, MockNetProcessor } from "xray16/mocks";
import { getFunctionMock } from "xray16/testing/utils";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { EWeatherPeriodType, IWeatherState } from "@/engine/core/managers/weather/weather_types";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { resetRegistry } from "@/fixtures/engine";

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

    expect(eventsManager.getSubscribersCount()).toBe(3);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE_2500)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_GO_ONLINE)).toBe(1);

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

    expect(table.size(manager.weatherState)).toBe(1);
    expect(manager.weatherState).toEqualLuaTables(
      $fromObject<string, IWeatherState>({
        dynamic_default: {
          currentState: "clear",
          weatherGraph: $fromObject<TName, TProbability>({
            clear: 0.2,
            cloudy: 0.2,
            foggy: 0.1,
            partly: 0.2,
            rain: 0.1,
            thunder: 0.1,
            veryfoggy: 0.1,
          }),
          weatherName: "dynamic_default",
          nextState: "cloudy",
        },
      })
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
      EMockPacketDataType.STRING,
      EMockPacketDataType.STRING,
      EMockPacketDataType.U32,
      EMockPacketDataType.U32,
      EMockPacketDataType.U32,
      EMockPacketDataType.STRING,
      EMockPacketDataType.STRING,
      EMockPacketDataType.U16,
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

  it("should correctly handle debug dump event", () => {
    const manager: WeatherManager = getManager(WeatherManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ WeatherManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ WeatherManager: expect.any(Object) });
  });
});
