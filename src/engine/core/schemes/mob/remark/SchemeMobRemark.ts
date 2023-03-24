import { XR_game_object, XR_ini_file } from "xray16";

import { getMonsterState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeMobRemarkState } from "@/engine/core/schemes/mob/remark/ISchemeMobRemarkState";
import { MobRemarkManager } from "@/engine/core/schemes/mob/remark/MobRemarkManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniConditionList, readIniString } from "@/engine/core/utils/ini/getters";
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

    state.logic = getConfigSwitchConditions(ini, section);
    state.state = getMonsterState(ini, section);
    state.dialog_cond = readIniConditionList(ini, section, "dialog_cond");
    state.no_reset = true;
    state.anim = readIniString(ini, section, "anim", false, "");
    state.anim_movement = readIniBoolean(ini, section, "anim_movement", false, false);
    state.anim_head = readIniString(ini, section, "anim_head", false, "");
    state.tip = readIniString(ini, section, "tip", false, "");
    state.snd = readIniString(ini, section, "snd", false, "");
    state.time = readIniString(ini, section, "time", false, "");
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
