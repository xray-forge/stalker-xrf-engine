import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TIndex, TName, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { CodeManager } from "@/mod/scripts/core/schemes/ph_code/CodeManager";
import { ISchemeCodeState } from "@/mod/scripts/core/schemes/ph_code/ISchemeCodeState";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  getConfigConditionList,
  getConfigNumber,
  getConfigString,
  getConfigStringAndCondList,
  getConfigSwitchConditions,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeCode");

/**
 * todo;
 */
export class SchemeCode extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_CODE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCodeState
  ): void {
    subscribeActionForEvents(object, state, new CodeManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeCodeState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.tips = getConfigString(ini, section, "tips", object, false, "", "st_codelock");

    object.set_tip_text(state.tips);

    state.code = getConfigNumber(ini, section, "code", object, false);

    if (state.code) {
      state.on_code = getConfigConditionList(ini, section, "on_code", object);
    } else {
      state.on_check_code = new LuaTable();

      let it: TIndex = 1;
      let cc = getConfigStringAndCondList(ini, section, "on_check_code" + it, object);

      while (cc) {
        state.on_check_code.set(cc.v1 as TName, cc.condlist);
        it += 1;
        cc = getConfigStringAndCondList(ini, section, "on_check_code" + it, object);
      }
    }
  }
}
