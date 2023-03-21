import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemePhysicalButtonState } from "@/engine/core/schemes/ph_button/ISchemePhysicalButtonState";
import { PhysicalButtonManager } from "@/engine/core/schemes/ph_button/PhysicalButtonManager";
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
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalButtonState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.on_press = getConfigConditionList(ini, section, "on_press");
    state.tooltip = getConfigString(ini, section, "tooltip", false, "");

    if (state.tooltip) {
      object.set_tip_text(state.tooltip);
    } else {
      object.set_tip_text("");
    }

    state.anim = getConfigString(ini, section, "anim", true, "");
    state.blending = getConfigBoolean(ini, section, "anim_blend", false, true);
    if (state.blending === null) {
      state.blending = true;
    }
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalButtonState
  ): void {
    SchemePhysicalButton.subscribe(object, state, new PhysicalButtonManager(object, state));
  }
}
