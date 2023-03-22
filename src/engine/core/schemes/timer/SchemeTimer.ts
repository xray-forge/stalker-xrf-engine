import { get_hud, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeTimerState } from "@/engine/core/schemes/timer/ISchemeTimerState";
import { SchemeTimerManager } from "@/engine/core/schemes/timer/SchemeTimerManager";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseTimerData } from "@/engine/core/utils/parse";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeTimer extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_TIMER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeTimerState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.type = readIniString(ini, section, "type", false, "", "inc");

    if (state.type !== "inc" && state.type !== "dec") {
      abort("ERROR: wrong sr_timer type. Section [%s], Restrictor [%s]", section, object.name());
    }

    if (state.type === "dec") {
      state.start_value = readIniNumber(ini, section, "start_value", true);
    } else {
      state.start_value = readIniNumber(ini, section, "start_value", false, 0);
    }

    state.on_value = parseTimerData(object, readIniString(ini, section, "on_value", false, ""));
    state.timer_id = readIniString(ini, section, "timer_id", false, "", "hud_timer");
    state.string = readIniString(ini, section, "string", false, "");

    state.ui = get_hud();
    state.ui.AddCustomStatic(state.timer_id, true);
    state.timer = state.ui.GetCustomStatic(state.timer_id)!.wnd();

    if (state.string !== null) {
      state.ui.AddCustomStatic("hud_timer_text", true);
      state.ui.GetCustomStatic("hud_timer_text")!.wnd().TextControl().SetTextST(state.string);
    }
  }

  /**
   * Add scheme to object binder for initialization.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeTimerState
  ): void {
    SchemeTimer.subscribe(object, state, new SchemeTimerManager(object, state));
  }
}
