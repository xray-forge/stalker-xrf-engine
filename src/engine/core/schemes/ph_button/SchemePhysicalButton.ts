import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemePhysicalButtonState } from "@/engine/core/schemes/ph_button/ISchemePhysicalButtonState";
import { PhysicalButtonManager } from "@/engine/core/schemes/ph_button/PhysicalButtonManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigBoolean, getConfigConditionList, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalButton extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_BUTTON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo: Description.
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
   * todo: Description.
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
