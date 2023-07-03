import { level } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  DYNAMIC_WEATHER_GRAPHS,
  GAME_LTX,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { assert } from "@/engine/core/utils/assertion";
import {
  parseAllSectionToTable,
  parseConditionsList,
  pickSectionFromCondList,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import {
  LuaArray,
  NetPacket,
  NetProcessor,
  Optional,
  StringOptional,
  TName,
  TNumberId,
  TProbability,
  TRate,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export interface IWeatherState {
  currentState: Optional<TName>;
  nextState: Optional<TName>;
  weatherName: TName;
  weatherGraph: LuaTable<TName, TProbability>;
}

/**
 * Initialize weather and manage updating of it hourly.
 */
export class WeatherManager extends AbstractCoreManager {
  /**
   * ID of post-process effector unique to current level.
   */
  public static readonly LEVEL_WEATHER_PP_EFFECTOR_ID: TNumberId = 999;

  public shouldForceWeatherChangeOnTimeChange: boolean = false;
  public lastHour: number = 0;
  public wfxTime: number = 0;

  /**
   * Currently active weather camera effector name.
   */
  public weatherFx: Optional<TName> = null;
  /**
   * Condition list for current weathers.
   */
  public weatherList: TConditionList = new LuaTable();

  /**
   * Currently active weather name.
   */
  public weatherName: TName = "";
  /**
   * Currently active weather graph.
   */
  public weatherGraph: LuaTable<TName, TProbability> = new LuaTable();
  /**
   * Currently active weather section.
   */
  public weatherSection: TSection = "";

  /**
   * Map of weathers by level, where each level has related weathers + probabilities.
   */
  public graphs: LuaTable<TName, Optional<LuaTable<TName, TProbability>>> = new LuaTable();
  public state: LuaTable<TName, IWeatherState> = new LuaTable();

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_NET_SPAWN, this.onActorNetworkSpawn, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_NET_SPAWN, this.onActorNetworkSpawn);
  }

  /**
   * Mark weather change as needed on next update.
   */
  public forceWeatherChange(): void {
    logger.info("Force weather change");
    this.shouldForceWeatherChangeOnTimeChange = true;
  }

  /**
   * Generic update iteration.
   */
  public override update(): void {
    this.weatherFx = level.is_wfx_playing() ? level.get_weather() : null;

    const timeHours: number = level.get_time_hours();

    if (this.lastHour !== timeHours) {
      this.lastHour = timeHours;

      this.updateWeatherStates();
      this.updateWeather(false);
    }
  }

  /**
   * Rotate current weather states.
   */
  public updateWeatherStates(): void {
    for (const [, weatherState] of this.state) {
      weatherState.currentState = weatherState.nextState;
      weatherState.nextState = this.getNextWeatherFromGraph(weatherState.weatherGraph);
    }
  }

  /**
   * Try to change current weather.
   */
  public updateWeather(now: boolean): void {
    this.weatherName = pickSectionFromCondList(registry.actor, registry.actor, this.weatherList) as TName;
    this.weatherGraph = this.getGraphByName(this.weatherName);

    if (this.weatherGraph === null) {
      this.state.delete(this.weatherName);
      this.weatherSection = this.weatherName;
    } else {
      // Initialize weather state by name.
      if (
        this.state.get(this.weatherName) === null ||
        this.state.get(this.weatherName).weatherName !== this.weatherName
      ) {
        this.state.set(this.weatherName, this.initStateByGraph(this.weatherName, this.weatherGraph));
      }

      this.weatherSection = "default_" + this.state.get(this.weatherName).currentState;
    }

    // Force change now if marked as needed.
    if (this.shouldForceWeatherChangeOnTimeChange) {
      now = true;
      this.shouldForceWeatherChangeOnTimeChange = false;
    }

    if (now) {
      this.lastHour = level.get_time_hours();
    }

    if (this.weatherFx) {
      level.start_weather_fx_from_time(this.weatherFx, this.wfxTime);
    } else {
      level.set_weather(this.weatherSection, now);
    }

    logger.info("Updating weather:", this.weatherSection, this.weatherFx, now);
  }

  /**
   * Initialize state object based on provided weather and graph.
   */
  protected initStateByGraph(weatherName: TName, weatherGraph: LuaTable<TName, TProbability>): IWeatherState {
    return {
      currentState: this.getNextWeatherFromGraph(weatherGraph),
      nextState: this.getNextWeatherFromGraph(weatherGraph),
      weatherName: weatherName,
      weatherGraph: weatherGraph,
    };
  }

  /**
   * todo: Description.
   */
  protected getNextWeatherFromGraph(weatherGraph: LuaTable<TName, TProbability>): TName {
    let totalProbability: TRate = 0;

    for (const [, probability] of weatherGraph) {
      totalProbability = totalProbability + probability;
    }

    let random: TRate = math.random() * totalProbability;
    let nextState: Optional<TName> = null;

    // Iterate over possible weathers and try to pick one of them based on their weight.
    for (const [weatherName, weatherProbability] of weatherGraph) {
      nextState = weatherName;
      random -= weatherProbability;

      if (random <= 0) {
        break;
      }
    }

    return nextState as TName;
  }

  /**
   * Read serialized string and transform it into current state.
   */
  public setStateAsString(stateString: string): void {
    this.state = new LuaTable();

    for (const weatherString of string.gfind(stateString, "[^;]+")) {
      const [i, j, groupName, currentState, nextState] = string.find(weatherString, "([^=]+)=([^,]+),([^,]+)");

      assert(
        groupName,
        "WeatherManager::setStateAsString got malformed state string '%s', '%s' parsed as '%'.",
        stateString,
        weatherString,
        groupName
      );

      const graphName: TName = groupName as TName;
      const graph: LuaTable<TName, TProbability> = this.getGraphByName(graphName);

      if (graph !== null) {
        this.state.set(graphName, {
          currentState: currentState as TName,
          nextState: nextState as TName,
          weatherName: graphName,
          weatherGraph: graph!,
        });
      }
    }
  }

  /**
   * Transform current state into string.
   * @returns string containing level states, example: `dynamic_default=clear,cloudy;another=cloudy,rainy`
   */
  public getStateAsString(): string {
    const levelStrings: LuaArray<string> = new LuaTable();

    for (const [, weatherState] of this.state) {
      table.insert(
        levelStrings,
        weatherState.weatherName + "=" + weatherState.currentState + "," + weatherState.nextState
      );
    }

    return table.concat(levelStrings, ";");
  }

  /**
   * todo: Description.
   */
  protected getGraphByName(name: TName): LuaTable<TName, TProbability> {
    if (!this.graphs.has(name)) {
      this.graphs.set(name, parseAllSectionToTable(DYNAMIC_WEATHER_GRAPHS, name));
    }

    return this.graphs.get(name) as LuaTable<TName, TProbability>;
  }

  /**
   * Handle actor net spawn.
   */
  protected onActorNetworkSpawn(): void {
    logger.info("Initialize weather on network spawn");

    const levelName: TName = level.name();
    const levelWeather: TName = readIniString(GAME_LTX, levelName, "weathers", false, "", "[default]");
    const levelPostprocess: Optional<TName> = readIniString(GAME_LTX, levelName, "postprocess", false, "");

    // Level specific post-processors.
    if (levelPostprocess === null) {
      level.remove_pp_effector(WeatherManager.LEVEL_WEATHER_PP_EFFECTOR_ID);
    } else {
      level.add_pp_effector(levelPostprocess, WeatherManager.LEVEL_WEATHER_PP_EFFECTOR_ID, true);
    }

    this.weatherList = parseConditionsList(levelWeather);

    logger.info("Possible weathers condition list:", levelWeather);

    this.updateWeather(true);
    this.lastHour = level.get_time_hours();
  }

  /**
   * Load current state / related info.
   */
  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, WeatherManager.name);

    const stateString: string = reader.r_stringZ();

    this.setStateAsString(stateString);

    const weatherFx: StringOptional = reader.r_stringZ();

    if (weatherFx !== NIL) {
      this.weatherFx = weatherFx;
      this.wfxTime = reader.r_float();
    }

    closeLoadMarker(reader, WeatherManager.name);
  }

  /**
   * Save current state / related info.
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, WeatherManager.name);

    packet.w_stringZ(this.getStateAsString());
    packet.w_stringZ(tostring(this.weatherFx));

    if (this.weatherFx) {
      packet.w_float(level.get_wfx_time());
    }

    closeSaveMarker(packet, WeatherManager.name);
  }
}
