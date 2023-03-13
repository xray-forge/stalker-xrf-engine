import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { ISchemePhysicalIdleState } from "@/mod/scripts/core/schemes/ph_idle/ISchemePhysicalIdleState";
import { PhysicalIdleManager } from "@/mod/scripts/core/schemes/ph_idle/PhysicalIdleManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  getConfigBoolean,
  getConfigConditionList,
  getConfigString,
  getConfigSwitchConditions,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseData1v } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalIdle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_IDLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalIdleState
  ): void {
    subscribeActionForEvents(object, state, new PhysicalIdleManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalIdleState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.hit_on_bone = parseData1v(object, getConfigString(ini, section, "hit_on_bone", object, false, ""));
    state.nonscript_usable = getConfigBoolean(ini, section, "nonscript_usable", object, false);
    state.on_use = getConfigConditionList(ini, section, "on_use", object);
    state.tips = getConfigString(ini, section, "tips", object, false, "", "");

    object.set_tip_text(state.tips);
  }
}
