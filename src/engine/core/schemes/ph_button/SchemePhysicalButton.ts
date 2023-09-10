import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { ISchemePhysicalButtonState } from "@/engine/core/schemes/ph_button/ISchemePhysicalButtonState";
import { PhysicalButtonManager } from "@/engine/core/schemes/ph_button/PhysicalButtonManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniConditionList, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

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
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalButtonState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.on_press = readIniConditionList(ini, section, "on_press");
    state.tooltip = readIniString(ini, section, "tooltip", false, "");

    if (state.tooltip) {
      object.set_tip_text(state.tooltip);
    } else {
      object.set_tip_text("");
    }

    state.anim = readIniString(ini, section, "anim", true, "");
    state.blending = readIniBoolean(ini, section, "anim_blend", false, true);
    if (state.blending === null) {
      state.blending = true;
    }
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalButtonState
  ): void {
    SchemePhysicalButton.subscribe(object, state, new PhysicalButtonManager(object, state));
  }
}
