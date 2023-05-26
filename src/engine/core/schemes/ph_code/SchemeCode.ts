import { game_object, ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { CodeManager } from "@/engine/core/schemes/ph_code/CodeManager";
import { ISchemeCodeState } from "@/engine/core/schemes/ph_code/ISchemeCodeState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import {
  getConfigStringAndCondList,
  readIniConditionList,
  readIniNumber,
  readIniString,
} from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TIndex, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCode extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_CODE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo: Description.
   */
  public static override activate(object: game_object, ini: ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeCodeState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.tips = readIniString(ini, section, "tips", false, "", "st_codelock");

    object.set_tip_text(state.tips);

    state.code = readIniNumber(ini, section, "code", false);

    if (state.code) {
      state.on_code = readIniConditionList(ini, section, "on_code");
    } else {
      state.on_check_code = new LuaTable();

      let it: TIndex = 1;
      let cc = getConfigStringAndCondList(ini, section, "on_check_code" + it);

      while (cc) {
        state.on_check_code.set(cc.v1 as TName, cc.condlist);
        it += 1;
        cc = getConfigStringAndCondList(ini, section, "on_check_code" + it);
      }
    }
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: game_object,
    ini: ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCodeState
  ): void {
    SchemeCode.subscribe(object, state, new CodeManager(object, state));
  }
}
