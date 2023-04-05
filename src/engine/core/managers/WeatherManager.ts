import { level, TXR_net_processor, XR_net_packet } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  DYNAMIC_WEATHER_GRAPHS,
  GAME_LTX,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, parseIniSectionToArray, TConditionList } from "@/engine/core/utils/parse";
import { NIL } from "@/engine/lib/constants/words";
import { LuaArray, Optional, StringOptional, TName, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export interface IWeatherState {
  current_state: Optional<string>;
  next_state: Optional<string>;
  graph_name: string;
  graph: LuaTable<string, number>;
}

/**
 * todo;
 */
export class WeatherManager extends AbstractCoreManager {
  public last_hour: number = 0;
  public wfx_time: number = 0;
  public forced_weather_change_on_time_change: boolean = false;
  public weather_fx: Optional<string> = null;
  public weather_list: TConditionList = new LuaTable();

  public state: LuaTable<string, IWeatherState> = new LuaTable();
  public graphs: LuaTable<string, LuaTable<string, number>> = new LuaTable();

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
   * todo: Description.
   */
  public reset(): void {
    const weather: string = readIniString(GAME_LTX, level.name(), "weathers", false, "", "[default]");
    const postprocess: string = readIniString(GAME_LTX, level.name(), "postprocess", false, "");

    if (postprocess !== null) {
      level.add_pp_effector(postprocess, 999, true);
    } else {
      level.remove_pp_effector(999);
    }

    if (weather === "[default]") {
      this.weather_list = parseConditionsList("[default]");
    } else {
      this.weather_list = parseConditionsList(weather);
    }

    this.selectWeather(true);
    this.last_hour = level.get_time_hours();
  }

  /**
   * todo: Description.
   */
  public forcedWeatherChange(): void {
    logger.info("Force weather change");
    this.forced_weather_change_on_time_change = true;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    if (level.is_wfx_playing()) {
      this.weather_fx = level.get_weather();
    } else {
      this.weather_fx = null;
    }

    if (this.last_hour !== level.get_time_hours()) {
      this.last_hour = level.get_time_hours();
      for (const [lvl, st] of this.state) {
        st.current_state = st.next_state;
        st.next_state = this.getNextState(st.graph, st.current_state);
      }

      this.selectWeather(false);
    }
  }

  /**
   * todo: Description.
   */
  public selectWeather(now: boolean): void {
    const weather = pickSectionFromCondList(registry.actor, registry.actor, this.weather_list)!;
    const graph = this.getGraphByName(weather);
    let weather_section_name = "";

    if (graph === null) {
      this.state.delete(weather);
      weather_section_name = weather;
    } else {
      if (this.state.get(weather) === null || this.state.get(weather).graph_name !== weather) {
        // -- ���� ���������. ��������� �� ����.
        this.state.set(weather, this.initByGraph(graph, weather));
        // -- else
        // -- now = false
      }

      // -- ������� �������� ������ �� �������� ���������.
      const st = this.state.get(weather);

      // --weather_section_name="dw_"..st.current_state.."_"..st.next_state.."_"..level.get_time_hours()
      weather_section_name = "default_" + st.current_state;
    }

    if (now) {
      this.last_hour = level.get_time_hours();
    }

    if (this.forced_weather_change_on_time_change) {
      now = true;
      this.forced_weather_change_on_time_change = false;
    }

    if (!this.weather_fx) {
      level.set_weather(weather_section_name, now);
    } else {
      level.start_weather_fx_from_time(this.weather_fx, this.wfx_time);
    }

    /**
     *   printf("WEATHER: '%s' now '%s'", weather_section_name, tostring(now))
     *   // -- if xrs_news then
     *   // -- xrs_news.news_call(1,1,null,null,weather_section_name,null)
     *   // -- end
     */
  }

  /**
   * todo: Description.
   */
  public initByGraph(graph: LuaTable<string, number>, graph_name: string): IWeatherState {
    const cur_state: string = this.getNextState(graph, "");
    const next_state = this.getNextState(graph, cur_state);

    return { current_state: cur_state, next_state: next_state, graph_name: graph_name, graph: graph };
  }

  /**
   * todo: Description.
   */
  public getNextState(graph: LuaTable<string, number>, state: Optional<string>): string {
    let sum = 0;

    for (const [st, prob] of graph) {
      // --if state==st then prob=prob*2 end
      sum = sum + prob;
    }

    let rnd = math.random() * sum;
    let nextState: Optional<string> = null;

    for (const [st, prob] of pairs(graph)) {
      // --if state==st then prob=prob*2 end
      nextState = st;
      rnd = rnd - prob;
      if (rnd <= 0) {
        break;
      }
    }

    return nextState as string;
  }

  /**
   * todo: Description.
   */
  public setStateAsString(ss: string): void {
    this.state = new LuaTable();
    for (const [lvlstring] of string.gmatch(ss, "[^;]+")) {
      const [i, j, grname, curs, nexs] = string.find(lvlstring, "([^=]+)=([^,]+),([^,]+)");

      if (!grname) {
        abort("WeatherManager:set_state_as_string: malformed state string. " + ss);
      }

      // --const lvl_name=this.unpack_level(lvl)
      const current_state = this.unpackState(curs);
      const next_state = this.unpackState(nexs);
      const graph_name = this.unpackGraphName(grname as string);
      const graph = this.getGraphByName(graph_name);

      if (graph === null) {
        // nothing
      } else {
        this.state.set(graph_name, {
          current_state: current_state as string,
          next_state: next_state as string,
          graph_name: graph_name,
          graph: graph!,
        });
      }
    }
  }

  /**
   * todo: Description.
   */
  public getStateAsString(): string {
    const lvlstrings: LuaArray<string> = new LuaTable();

    for (const [lvl_name, st] of this.state) {
      // --const lvl=this.pack_level(lvl_name)
      const curs = this.packState(st.current_state);
      const nexs = this.packState(st.next_state);
      const grn = this.packGraphName(st.graph_name);

      table.insert(lvlstrings, grn + "=" + curs + "," + nexs);
    }

    return table.concat(lvlstrings, ";");
  }

  /**
   * todo: Description.
   */
  public getGraphByName(name: TName): LuaTable<string, number> {
    if (!this.graphs.has(name)) {
      this.graphs.set(name, parseIniSectionToArray(DYNAMIC_WEATHER_GRAPHS, name) as any);
    }

    return this.graphs.get(name);
  }

  /**
   * todo: Description.
   */
  public packState<T>(state: T): T {
    return state;
  }

  /**
   * todo: Description.
   */
  public unpackState<T>(state: T): T {
    return state;
  }

  /**
   * todo: Description.
   */
  public packGraphName(name: TName): string {
    return name;
  }

  /**
   * todo: Description.
   */
  public unpackGraphName(name: TName): string {
    return name;
  }

  /**
   * Handle actor net spawn.
   */
  public onActorNetworkSpawn(): void {
    logger.info("Reset weather on net spawn");
    this.reset();
  }

  /**
   * todo: Description.
   */
  public override load(reader: TXR_net_processor): void {
    openLoadMarker(reader, WeatherManager.name);

    const state_string = reader.r_stringZ();

    this.setStateAsString(state_string);

    const weatherFx: StringOptional = reader.r_stringZ();

    if (weatherFx !== NIL) {
      this.weather_fx = weatherFx;
      this.wfx_time = reader.r_float();
    }

    closeLoadMarker(reader, WeatherManager.name);
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, WeatherManager.name);

    packet.w_stringZ(this.getStateAsString());
    packet.w_stringZ(tostring(this.weather_fx));

    if (this.weather_fx) {
      packet.w_float(level.get_wfx_time());
    }

    closeSaveMarker(packet, WeatherManager.name);
  }
}
