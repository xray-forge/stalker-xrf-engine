import { get_hud, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { ISchemeTimerState } from "@/engine/core/schemes/timer/ISchemeTimerState";
import { SchemeTimerManager } from "@/engine/core/schemes/timer/SchemeTimerManager";
import { abort } from "@/engine/core/utils/debug";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini_config/config";
import { getConfigNumber, getConfigString } from "@/engine/core/utils/ini_config/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { LuaArray, Optional, TDistance } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeTimer extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_TIMER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * Add scheme to object binder for initialization.
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeTimerState
  ): void {
    subscribeActionForEvents(object, state, new SchemeTimerManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeTimerState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.type = getConfigString(ini, section, "type", object, false, "", "inc");

    if (state.type !== "inc" && state.type !== "dec") {
      abort("ERROR: wrong sr_timer type. Section [%s], Restrictor [%s]", section, object.name());
    }

    if (state.type === "dec") {
      state.start_value = getConfigNumber(ini, section, "start_value", object, true);
    } else {
      state.start_value = getConfigNumber(ini, section, "start_value", object, false, 0);
    }

    state.on_value = parse_data(object, getConfigString(ini, section, "on_value", object, false, ""));
    state.timer_id = getConfigString(ini, section, "timer_id", object, false, "", "hud_timer");
    state.string = getConfigString(ini, section, "string", object, false, "");

    state.ui = get_hud();
    state.ui.AddCustomStatic(state.timer_id, true);
    state.timer = state.ui.GetCustomStatic(state.timer_id)!.wnd();

    if (state.string !== null) {
      state.ui.AddCustomStatic("hud_timer_text", true);
      state.ui.GetCustomStatic("hud_timer_text")!.wnd().TextControl().SetTextST(state.string);
    }
  }
}

// todo: Probably same in utils?
function parse_data(object: XR_game_object, str: Optional<string>): LuaArray<{ dist: TDistance; state: any }> {
  const data: LuaArray<any> = new LuaTable();

  if (str) {
    for (const name of string.gfind(str, "(%|*%d+%|[^%|]+)%p*")) {
      const [t_pos] = string.find(name, "|", 1, true);

      const dist: Optional<string> = string.sub(name, 1, t_pos - 1);
      const state: Optional<string> = string.sub(name, t_pos + 1);

      table.insert(data, {
        dist: tonumber(dist)!,
        state: state === null ? null : parseConditionsList(state),
      });
    }
  }

  return data;
}
