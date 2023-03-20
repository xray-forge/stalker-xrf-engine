import { vector, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMobJumpState } from "@/engine/core/schemes/mob/jump/ISchemeMobJumpState";
import { MobJumpManager } from "@/engine/core/schemes/mob/jump/MobJumpManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { abort } from "@/engine/core/utils/debug";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini_config/config";
import { getConfigNumber, getConfigString } from "@/engine/core/utils/ini_config/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseNames } from "@/engine/core/utils/parse";
import { EScheme, ESchemeType, LuaArray, TSection } from "@/engine/lib/types";

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

    const offsetsData: string = getConfigString(ini, section, "offset", object, true, "");
    const offsets: LuaArray<string> = parseNames(offsetsData);

    state.offset = new vector().set(tonumber(offsets.get(1))!, tonumber(offsets.get(2))!, tonumber(offsets.get(3))!);

    if (!ini.line_exist(section, "on_signal")) {
      abort("Bad jump scheme usage! 'on_signal' line must be specified.");
    }
  }
}
