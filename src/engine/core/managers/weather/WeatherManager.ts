import { CTime, game, level } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  GAME_LTX,
  getManager,
  getManagerByName,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import type { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import {
  canUsePeriodsForWeather,
  getNextWeatherFromGraph,
  isIndoorWeather,
  isPreBlowoutWeather,
  isTransitionWeather,
} from "@/engine/core/managers/weather/utils";
import { IWeatherState } from "@/engine/core/managers/weather/weather_types";
import { DYNAMIC_WEATHER_GRAPHS } from "@/engine/core/managers/weather/WeatherConfig";
import { assert } from "@/engine/core/utils/assertion";
import { executeConsoleCommandsFromSection } from "@/engine/core/utils/console";
import {
  parseAllSectionToTable,
  parseConditionsList,
  parseNumbersList,
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
  TCount,
  TDuration,
  TIndex,
  TName,
  TProbability,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Initialize weather and manage updating of it hourly.
 */
export class WeatherManager extends AbstractManager {
  public shouldForceWeatherChangeOnTimeChange: boolean = false;

  public lastUpdatedAtHour: TTimestamp = 0;
  public weatherLastPeriodChangeHour: TTimestamp = 0;
  public weatherNextPeriodChangeHour: TTimestamp = 0;

  public isWeatherPeriodTransition: boolean = false;
  public isWeatherPeriodPreBlowout: boolean = false;

  public weatherFx: Optional<TName> = null;
  public weatherFxTime: TTimestamp = 0;

  public weatherSection: TName = "";
  public weatherConditionList: TConditionList = new LuaTable();
  public weatherGraph: LuaTable<TName, TProbability> = new LuaTable();

  // Map of states for weather sections, where key is name and value is probability.
  public weatherState: LuaTable<TName, IWeatherState> = new LuaTable();
  // List of possible weather periods (like good, neutral, bad etc).
  public weatherPeriods: LuaTable<TIndex, TName> = new LuaTable();
  // Duration of weather periods mapped.
  public weatherPeriodsRange: LuaTable<TName, LuaArray<TTimestamp>> = new LuaTable();
  // Weather period index by weather period name.
  public weatherPeriodsInverse: LuaTable<TName, TIndex> = new LuaTable();
  // Currently active weather period.
  public weatherPeriod: Optional<TName> = null;

  // Map of weathers change graphs for weather section, where key is name and value is probability.
  public graphs: LuaTable<TName, Optional<LuaTable<TName, TProbability>>> = new LuaTable();

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_ONLINE, this.onActorNetworkSpawn, this);

    // Initialize weathers configuration.
    this.initializeWeatherPeriods();

    // Apply settings for console if any exist.
    executeConsoleCommandsFromSection("weather_console_settings", DYNAMIC_WEATHER_GRAPHS);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_ONLINE, this.onActorNetworkSpawn);
  }

  /**
   * Read weather periods list for configuration.
   * Initialize lists based on weather graphs periods.
   *
   * Each period includes set of weathers to run and change from time to time.
   */
  public initializeWeatherPeriods(): void {
    const weatherPeriodsLines: TCount = DYNAMIC_WEATHER_GRAPHS.section_exist("weather_periods")
      ? DYNAMIC_WEATHER_GRAPHS.line_count("weather_periods")
      : 0;

    // Reset lists.
    this.weatherPeriods = new LuaTable();
    this.weatherPeriodsInverse = new LuaTable();
    this.weatherPeriodsRange = new LuaTable();

    for (const it of $range(0, weatherPeriodsLines - 1)) {
      const [, field, value] = DYNAMIC_WEATHER_GRAPHS.r_line("weather_periods", it, "", "");

      logger.format("Initialize weather period: %s %s", field, value);

      this.weatherPeriods.set(it + 1, field);
      this.weatherPeriodsInverse.set(field, it + 1);
      this.weatherPeriodsRange.set(field, parseNumbersList(value));
    }

    // Set default weather period.
    this.weatherPeriod = this.weatherPeriods.get(1) as TName;
  }

  /**
   * @param period - target period to transition from
   * @returns weather period duration based on weather period duration range
   */
  public getNextPeriodChangeHour(period: TName): TTimestamp {
    const range: LuaArray<TTimestamp> = this.weatherPeriodsRange.get(period);
    const hour: TTimestamp = math.random(range.get(1), range.get(2));

    // Randomize weather change hour and make sure it is in 0..24 range.
    return math.mod(hour + this.weatherLastPeriodChangeHour + 1, 24);
  }

  /**
   * Apply next period entity from possible weathers.
   * Changes list of possible weathers to activate now.
   */
  public setNextPeriod(): void {
    const nextIndex: TIndex =
      math.mod(this.weatherPeriodsInverse.get(this.weatherPeriod as TName), this.weatherPeriods.length()) + 1;

    this.weatherPeriod = this.weatherPeriods.get(nextIndex);
    this.weatherNextPeriodChangeHour = this.getNextPeriodChangeHour(this.weatherPeriod);
    this.isWeatherPeriodTransition = true;
  }

  /**
   * Change weather period in range.
   */
  public changePeriod(): void {
    const currentTimeHour: TTimestamp = level.get_time_hours();
    const surgeManager: SurgeManager = getManagerByName("SurgeManager") as SurgeManager;
    const gameTime: CTime = game.get_game_time();
    const timeToSurge: TDuration = math.floor(
      surgeManager.nextScheduledSurgeDelay - gameTime.diffSec(surgeManager.lastSurgeAt)
    );
    const shouldCheckOutdoor: string = readIniString(
      DYNAMIC_WEATHER_GRAPHS,
      level.name() + "_surge_settings",
      "surge_state",
      false,
      null,
      "0"
    );

    // Surge will happen soon.
    if ((shouldCheckOutdoor === "1" && timeToSurge < 7200) || level.is_wfx_playing()) {
      this.isWeatherPeriodPreBlowout = true;
      this.weatherNextPeriodChangeHour = math.mod(this.weatherNextPeriodChangeHour + 1, 24);
    }

    // Change weathers period.
    if (currentTimeHour === this.weatherNextPeriodChangeHour) {
      logger.format("Changing weather period: %s", currentTimeHour);

      this.weatherLastPeriodChangeHour = currentTimeHour;
      this.setNextPeriod();
    }
  }

  /**
   * Mark weather change as needed on next update.
   */
  public forceWeatherChange(): void {
    logger.format("Force weather change");
    this.shouldForceWeatherChangeOnTimeChange = true;
  }

  /**
   * Generic update iteration.
   */
  public override update(): void {
    this.weatherFx = level.is_wfx_playing() ? level.get_weather() : null;

    const timeHours: TTimestamp = level.get_time_hours();

    // Every hour recalculate weather.
    if (this.lastUpdatedAtHour !== timeHours) {
      this.lastUpdatedAtHour = timeHours;

      this.updateWeatherStates();

      if (!isIndoorWeather(this.weatherSection)) {
        this.changePeriod();
      }

      this.updateWeather(false);
    }
  }

  /**
   * Rotate current weather states.
   */
  public updateWeatherStates(): void {
    for (const [, weatherState] of this.weatherState) {
      weatherState.currentState = weatherState.nextState;
      weatherState.nextState = getNextWeatherFromGraph(weatherState.weatherGraph);
    }
  }

  /**
   * Try to change current weather.
   */
  public updateWeather(now: boolean = false): void {
    let weatherSection: TSection = pickSectionFromCondList(
      registry.actor,
      registry.actor,
      this.weatherConditionList
    ) as TName;

    if (!isIndoorWeather(weatherSection)) {
      if (canUsePeriodsForWeather(weatherSection)) {
        if (this.isWeatherPeriodTransition) {
          weatherSection = "transition";
          this.isWeatherPeriodTransition = false;
        } else if (this.isWeatherPeriodPreBlowout) {
          weatherSection = "pre_blowout";
          this.isWeatherPeriodPreBlowout = false;
        } else {
          weatherSection = this.weatherPeriod as TName;
        }
      } else {
        if (!this.isWeatherPeriodTransition) {
          weatherSection = this.weatherPeriod as TName;
        } else if (this.isWeatherPeriodPreBlowout) {
          weatherSection = "pre_blowout";
          this.isWeatherPeriodPreBlowout = false;
        }
      }
    }

    this.weatherSection = weatherSection;
    this.weatherGraph = this.getGraphBySection(weatherSection);

    // Handle weathers without defined graphs.
    if (this.weatherGraph === null) {
      this.weatherState.delete(weatherSection);
    } else {
      // Initialize weather state by name.
      if (
        this.weatherState.get(weatherSection) === null ||
        this.weatherState.get(weatherSection).weatherName !== weatherSection
      ) {
        this.weatherState = new LuaTable();
        this.weatherState.set(weatherSection, {
          currentState: getNextWeatherFromGraph(this.weatherGraph),
          nextState: getNextWeatherFromGraph(this.weatherGraph),
          weatherName: weatherSection,
          weatherGraph: this.weatherGraph,
        });
      }

      // Picked weather from graph and can use it.
      weatherSection = "default_" + this.weatherState.get(weatherSection).currentState;
    }

    // Force change now if marked as needed.
    if (this.shouldForceWeatherChangeOnTimeChange) {
      now = true;
      this.shouldForceWeatherChangeOnTimeChange = false;
    }

    if (now) {
      this.lastUpdatedAtHour = level.get_time_hours();
    }

    if (this.weatherFx) {
      level.start_weather_fx_from_time(this.weatherFx, this.weatherFxTime);
      logger.format("Start weather FX: %s %s %s", this.weatherFx, this.weatherFxTime, now);
    } else {
      level.set_weather(weatherSection, now);
      logger.format("Updated weather: %s %s %s %s", this.weatherPeriod, weatherSection, this.weatherFx, now);
    }
  }

  /**
   * Read serialized string and transform it into current state.
   */
  public setStateAsString(stateString: string): void {
    this.weatherState = new LuaTable();

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
      const graph: Optional<LuaTable<TName, TProbability>> = this.getGraphBySection(graphName);

      if (graph !== null) {
        logger.format("Change weather graph: %s", stateString);

        this.weatherState.set(graphName, {
          currentState: currentState as TName,
          nextState: nextState as TName,
          weatherName: graphName,
          weatherGraph: graph,
        });
      }
    }
  }

  /**
   * Transform current state into string.
   *
   * @returns string containing level states, example: `dynamic_default=clear,cloudy;another=cloudy,rainy`
   */
  public getStateAsString(): string {
    const levelStrings: LuaArray<string> = new LuaTable();

    for (const [, weatherState] of this.weatherState) {
      table.insert(
        levelStrings,
        weatherState.weatherName + "=" + weatherState.currentState + "," + weatherState.nextState
      );
    }

    return table.concat(levelStrings, ";");
  }

  /**
   * Get weather changes graph by section name.
   *
   * @param section - name of the section to parse / read
   * @returns graph describing provided section
   */
  protected getGraphBySection(section: TSection): LuaTable<TName, TProbability> {
    if (!this.graphs.has(section)) {
      this.graphs.set(section, parseAllSectionToTable(DYNAMIC_WEATHER_GRAPHS, section));
    }

    return this.graphs.get(section) as LuaTable<TName, TProbability>;
  }

  /**
   * Handle actor net spawn.
   * Detect current level and environment, reset and re-init states.
   */
  protected onActorNetworkSpawn(): void {
    logger.format("Initialize weather on network spawn");

    const levelName: TName = level.name();
    const levelWeather: TName = readIniString(GAME_LTX, levelName, "weathers", false, null, "[default]");

    this.weatherSection = levelWeather;
    this.weatherConditionList = parseConditionsList(levelWeather);

    logger.format("Possible weathers condition list: %s", levelWeather);

    // Change period next hour or based on weather config.
    this.weatherNextPeriodChangeHour = canUsePeriodsForWeather(levelWeather)
      ? this.getNextPeriodChangeHour(this.weatherPeriod as TName)
      : math.mod(this.weatherNextPeriodChangeHour + 1, 24);

    this.lastUpdatedAtHour = level.get_time_hours();
    this.updateWeather(true);
  }

  /**
   * Load current state / related info.
   */
  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, WeatherManager.name);

    this.weatherSection = reader.r_stringZ();
    this.weatherPeriod = reader.r_stringZ();

    this.isWeatherPeriodTransition = isTransitionWeather(this.weatherSection);
    this.isWeatherPeriodPreBlowout = isPreBlowoutWeather(this.weatherSection);

    this.weatherLastPeriodChangeHour = reader.r_u32();
    this.weatherNextPeriodChangeHour = reader.r_u32();

    this.lastUpdatedAtHour = reader.r_u32();

    const stateString: string = reader.r_stringZ();

    this.setStateAsString(stateString);

    const weatherFx: StringOptional = reader.r_stringZ();

    if (weatherFx !== NIL) {
      this.weatherFx = weatherFx;
      this.weatherFxTime = reader.r_float();
    }

    closeLoadMarker(reader, WeatherManager.name);
  }

  /**
   * Save current state / related info.
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, WeatherManager.name);

    packet.w_stringZ(this.weatherSection);
    packet.w_stringZ(this.weatherPeriod);

    packet.w_u32(this.weatherLastPeriodChangeHour);
    packet.w_u32(this.weatherNextPeriodChangeHour);
    packet.w_u32(this.lastUpdatedAtHour);

    packet.w_stringZ(this.getStateAsString());
    packet.w_stringZ(tostring(this.weatherFx));

    if (this.weatherFx) {
      packet.w_float(level.get_wfx_time());
    }

    closeSaveMarker(packet, WeatherManager.name);
  }
}
