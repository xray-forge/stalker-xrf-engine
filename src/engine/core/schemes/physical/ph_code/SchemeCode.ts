import { GameObject, IniFile } from "xray16/alias";
import { Nillable, TIndex, TName, TSection } from "xray16/lib";

import {
  getConfigSwitchConditions,
  readIniConditionList,
  readIniNumber,
  readIniString,
  readIniStringAndCondList,
} from "@/engine/core/ini";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { CodeManager } from "@/engine/core/schemes/physical/ph_code/CodeManager";
import { ISchemeCodeState } from "@/engine/core/schemes/physical/ph_code/ph_code_types";
import { IBaseSchemeLogic } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";

/**
 * Scheme implementing code input for physical objects.
 * Mainly used with doors.
 */
export class SchemeCode extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_CODE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeCodeState {
    const state: ISchemeCodeState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.tips = readIniString(ini, section, "tips", false, null, "st_codelock");

    object.set_tip_text(state.tips);

    state.code = readIniNumber(ini, section, "code", false);

    if (state.code) {
      state.onCode = readIniConditionList(ini, section, "on_code");
    } else {
      state.onCheckCode = new LuaTable();

      let it: TIndex = 1;
      let cc: Nillable<IBaseSchemeLogic> = readIniStringAndCondList(ini, section, "on_check_code" + it);

      while (cc) {
        state.onCheckCode.set(cc.p1 as TName, cc.condlist);
        it += 1;
        cc = readIniStringAndCondList(ini, section, "on_check_code" + it);
      }
    }

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCodeState
  ): void {
    AbstractScheme.subscribe(state, new CodeManager(object, state));
  }
}
