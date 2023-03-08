import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { getMobState } from "@/mod/scripts/core/schemes/mob/MobStateManager";
import { ISchemeMobRemarkState } from "@/mod/scripts/core/schemes/mob/remark/ISchemeMobRemarkState";
import { MobRemarkManager } from "@/mod/scripts/core/schemes/mob/remark/MobRemarkManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  getConfigBoolean,
  getConfigConditionList,
  getConfigString,
  getConfigSwitchConditions,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeMobRemark");

/**
 * todo;
 */
export class SchemeMobRemark extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_REMARK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobRemarkState
  ): void {
    subscribeActionForEvents(object, state, new MobRemarkManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const state: ISchemeMobRemarkState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.state = getMobState(ini, section, object);
    state.dialog_cond = getConfigConditionList(ini, section, "dialog_cond", object);
    state.no_reset = true;
    state.anim = getConfigString(ini, section, "anim", object, false, "");
    state.anim_movement = getConfigBoolean(ini, section, "anim_movement", object, false, false);
    state.anim_head = getConfigString(ini, section, "anim_head", object, false, "");
    state.tip = getConfigString(ini, section, "tip", object, false, "");
    state.snd = getConfigString(ini, section, "snd", object, false, "");
    state.time = getConfigString(ini, section, "time", object, false, "");
  }
}
