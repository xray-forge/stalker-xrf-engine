import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  getConfigCondList,
  getConfigNumber,
  getConfigString,
  getConfigStringAndCondList,
  getConfigSwitchConditions,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeCode");

/**
 * todo;
 */
export class SchemeCode extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_CODE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    subscribeActionForEvents(object, storage, new SchemeCode(object, storage));
  }

  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.tips = getConfigString(ini, section, "tips", object, false, "", "st_codelock");

    object.set_tip_text(state.tips);

    state.code = getConfigNumber(ini, section, "code", object, false);

    if (state.code) {
      state.on_code = getConfigCondList(ini, section, "on_code", object);
    } else {
      state.on_check_code = {};

      let i: number = 1;
      let cc = getConfigStringAndCondList(ini, section, "on_check_code" + i, object);

      while (cc) {
        state.on_check_code[cc.v1] = cc.condlist;
        i = i + 1;
        cc = getConfigStringAndCondList(ini, section, "on_check_code" + i, object);
      }
    }
  }

  public override resetScheme(): void {
    this.object.set_nonscript_usable(false);
  }

  public use_callback(object: XR_game_object, who: XR_game_object): void {
    logger.info("Use codepad:", object.name(), who?.name());

    const numpad = get_global("ui_numpad").numpad(this);

    numpad.ShowDialog(true);
  }

  public OnNumberReceive(text: string): void {
    if (this.state.code) {
      if (tonumber(text) === this.state.code) {
        if (this.state.on_code) {
          pickSectionFromCondList(registry.actor, this.object, this.state.on_code.condlist);
        }
      }
    } else {
      const condlist = this.state.on_check_code[text];

      if (condlist) {
        pickSectionFromCondList(registry.actor, this.object, condlist);
      }
    }
  }

  public override deactivate(): void {
    this.object.set_tip_text("");
  }
}
