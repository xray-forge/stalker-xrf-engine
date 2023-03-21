import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { getMobState } from "@/engine/core/schemes/mob/MobStateManager";
import { ISchemeMobRemarkState } from "@/engine/core/schemes/mob/remark/ISchemeMobRemarkState";
import { MobRemarkManager } from "@/engine/core/schemes/mob/remark/MobRemarkManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigBoolean, getConfigConditionList, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobRemark extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_REMARK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo: Description.
   */
  public static override activate(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeMobRemarkState = AbstractScheme.assign(object, ini, scheme, section);

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

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobRemarkState
  ): void {
    SchemeMobRemark.subscribe(object, state, new MobRemarkManager(object, state));
  }
}
