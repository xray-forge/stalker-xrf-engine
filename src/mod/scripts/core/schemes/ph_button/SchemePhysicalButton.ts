import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { ISchemePhysicalButtonState } from "@/mod/scripts/core/schemes/ph_button/ISchemePhysicalButtonState";
import { PhysicalButtonManager } from "@/mod/scripts/core/schemes/ph_button/PhysicalButtonManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  getConfigBoolean,
  getConfigConditionList,
  getConfigString,
  getConfigSwitchConditions,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalButton extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_BUTTON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalButtonState
  ): void {
    subscribeActionForEvents(object, state, new PhysicalButtonManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalButtonState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.on_press = getConfigConditionList(ini, section, "on_press", object);
    state.tooltip = getConfigString(ini, section, "tooltip", object, false, "");

    if (state.tooltip) {
      object.set_tip_text(state.tooltip);
    } else {
      object.set_tip_text("");
    }

    state.anim = getConfigString(ini, section, "anim", object, true, "");
    state.blending = getConfigBoolean(ini, section, "anim_blend", object, false, true);
    if (state.blending === null) {
      state.blending = true;
    }
  }
}
