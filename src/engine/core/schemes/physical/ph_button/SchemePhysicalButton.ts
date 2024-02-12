import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { ISchemePhysicalButtonState } from "@/engine/core/schemes/physical/ph_button/ph_button_types";
import { PhysicalButtonManager } from "@/engine/core/schemes/physical/ph_button/PhysicalButtonManager";
import {
  getConfigSwitchConditions,
  readIniBoolean,
  readIniConditionList,
  readIniString,
} from "@/engine/core/utils/ini";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * Scheme implementing logics of button toggling for physical objects.
 */
export class SchemePhysicalButton extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_BUTTON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePhysicalButtonState {
    const state: ISchemePhysicalButtonState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.onPress = readIniConditionList(ini, section, "on_press");
    state.tooltip = readIniString(ini, section, "tooltip", false);
    state.anim = readIniString(ini, section, "anim", true);
    state.blending = readIniBoolean(ini, section, "anim_blend", false, true);

    object.set_tip_text(state.tooltip ? state.tooltip : "");

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalButtonState
  ): void {
    AbstractScheme.subscribe(state, new PhysicalButtonManager(object, state));
  }
}
