import { level, XR_net_packet, XR_reader } from "xray16";

import { DYNAMIC_WEATHER_GRAPHS, GAME_LTX, registry } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { abort } from "@/engine/core/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, parseIniSectionToArray, TConditionList } from "@/engine/core/utils/parse";
import { NIL } from "@/engine/lib/constants/words";
import { Optional } from "@/engine/lib/types";

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
  public update_time: number = 0;
  public forced_weather_change_on_time_change: boolean = false;
  public weather_fx: Optional<string> = null;
  public weather_list: TConditionList = new LuaTable();

  public state: LuaTable<string, IWeatherState> = new LuaTable();
  public graphs: LuaTable<string, LuaTable<string, number>> = new LuaTable();

  /**
   * todo: Description.
   */
  public reset(): void {
    const weather: string = getConfigString(GAME_LTX, level.name(), "weathers", registry.actor, false, "", "[default]");
    const postprocess: string = getConfigString(GAME_LTX, level.name(), "postprocess", registry.actor, false, "");

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

    this.select_weather(true);
    this.last_hour = level.get_time_hours();
  }

  /**
   * todo: Description.
   */
  public forced_weather_change(): void {
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
        st.next_state = this.get_next_state(st.graph, st.current_state);
      }

      this.select_weather(false);
    }
  }

  /**
   * todo: Description.
   */
  public select_weather(now: boolean): void {
    const weather = pickSectionFromCondList(registry.actor, registry.actor, this.weather_list)!;
    const graph = this.get_graph_by_name(weather);
    let weather_section_name = "";

    if (graph === null) {
      this.state.delete(weather);
      weather_section_name = weather;
    } else {
      if (this.state.get(weather) === null || this.state.get(weather).graph_name !== weather) {
        // -- ���� ���������. ��������� �� ����.
        this.state.set(weather, this.init_by_graph(graph, weather));
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
  public init_by_graph(graph: LuaTable<string, number>, graph_name: string): IWeatherState {
    const cur_state: string = this.get_next_state(graph, "");
    const next_state = this.get_next_state(graph, cur_state);

    return { current_state: cur_state, next_state: next_state, graph_name: graph_name, graph: graph };
  }

  /**
   * todo: Description.
   */
  public get_next_state(graph: LuaTable<string, number>, state: Optional<string>): string {
    let sum = 0;

    for (const [st, prob] of graph) {
      // --if state==st then prob=prob*2 end
      sum = sum + prob;
    }

    let rnd = math.random() * sum;
    let next_state: Optional<string> = null;

    for (const [st, prob] of pairs(graph)) {
      // --if state==st then prob=prob*2 end
      next_state = st;
      rnd = rnd - prob;
      if (rnd <= 0) {
        break;
      }
    }

    return next_state as string;
  }

  /**
   * todo: Description.
   */
  public set_state_as_string(ss: string): void {
    this.state = new LuaTable();
    for (const [lvlstring] of string.gmatch(ss, "[^;]+")) {
      const [i, j, grname, curs, nexs] = string.find(lvlstring, "([^=]+)=([^,]+),([^,]+)");

      if (!grname) {
        abort("WeatherManager:set_state_as_string: malformed state string. " + ss);
      }

      // --const lvl_name=this.unpack_level(lvl)
      const current_state = this.unpack_state(curs);
      const next_state = this.unpack_state(nexs);
      const graph_name = this.unpack_graph_name(grname as string);
      const graph = this.get_graph_by_name(graph_name);

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
  public get_state_as_string(): string {
    const lvlstrings: LuaTable<number, string> = new LuaTable();

    for (const [lvl_name, st] of this.state) {
      // --const lvl=this.pack_level(lvl_name)
      const curs = this.pack_state(st.current_state);
      const nexs = this.pack_state(st.next_state);
      const grn = this.pack_graph_name(st.graph_name);

      table.insert(lvlstrings, grn + "=" + curs + "," + nexs);
    }

    return table.concat(lvlstrings, ";");
  }

  /**
   * todo: Description.
   */
  public get_graph_by_name(name: string): LuaTable<string, number> {
    if (!this.graphs.has(name)) {
      this.graphs.set(name, parseIniSectionToArray(DYNAMIC_WEATHER_GRAPHS, name) as any);
    }

    return this.graphs.get(name);
  }

  /**
   * todo: Description.
   */
  public pack_state<T>(state: T): T {
    return state;
  }

  /**
   * todo: Description.
   */
  public unpack_state<T>(st: T): T {
    return st;
  }

  /**
   * todo: Description.
   */
  public pack_graph_name(graph_name: string): string {
    return graph_name;
  }

  /**
   * todo: Description.
   */
  public unpack_graph_name(grn: string): string {
    return grn;
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, WeatherManager.name);

    const state_string = reader.r_stringZ();

    this.set_state_as_string(state_string);
    this.update_time = reader.r_u32();

    const str = reader.r_stringZ();

    if (str !== NIL) {
      this.weather_fx = str;
      this.wfx_time = reader.r_float();
    }

    setLoadMarker(reader, true, WeatherManager.name);
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, WeatherManager.name);

    packet.w_stringZ(this.get_state_as_string());
    packet.w_u32(this.update_time);
    packet.w_stringZ(tostring(this.weather_fx));

    if (this.weather_fx) {
      packet.w_float(level.get_wfx_time());
    }

    setSaveMarker(packet, true, WeatherManager.name);
  }
}
