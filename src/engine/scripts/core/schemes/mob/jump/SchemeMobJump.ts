import { vector, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base";
import { ISchemeMobJumpState } from "@/engine/scripts/core/schemes/mob/jump/ISchemeMobJumpState";
import { MobJumpManager } from "@/engine/scripts/core/schemes/mob/jump/MobJumpManager";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { abort } from "@/engine/scripts/utils/debug";
import { getConfigSwitchConditions } from "@/engine/scripts/utils/ini_config/config";
import { getConfigNumber, getConfigString } from "@/engine/scripts/utils/ini_config/getters";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { parseNames } from "@/engine/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobJump extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_JUMP;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobJumpState
  ): void {
    subscribeActionForEvents(object, state, new MobJumpManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeMobJumpState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.jump_path_name = getConfigString(ini, section, "path_jump", object, false, additional);
    state.ph_jump_factor = getConfigNumber(ini, section, "ph_jump_factor", object, false, 1.8);

    const offset_str = getConfigString(ini, section, "offset", object, true, "");
    const elems = parseNames(offset_str);

    state.offset = new vector().set(tonumber(elems.get(1))!, tonumber(elems.get(2))!, tonumber(elems.get(3))!);

    if (!ini.line_exist(section, "on_signal")) {
      abort("Bad jump scheme usage! 'on_signal' line must be specified.");
    }
  }
}
