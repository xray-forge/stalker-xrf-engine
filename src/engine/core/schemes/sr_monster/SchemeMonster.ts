import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeMonsterState } from "@/engine/core/schemes/sr_monster/ISchemeMonsterState";
import { MonsterManager } from "@/engine/core/schemes/sr_monster/MonsterManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseNames } from "@/engine/core/utils/parse";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMonster extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_MONSTER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMonsterState
  ): void {
    subscribeActionForEvents(object, state, new MonsterManager(object, state));
  }

  /**
   * todo: Description.
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeMonsterState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.snd_obj = getConfigString(ini, section, "snd", object, false, "", null);
    state.delay = getConfigNumber(ini, section, "delay", object, false, 0);
    state.idle = getConfigNumber(ini, section, "idle", object, false, 30) * 10000;

    const path: string = getConfigString(ini, section, "sound_path", object, false, "", null)!;

    state.path_table = parseNames(path);
    state.monster = getConfigString(ini, section, "monster_section", object, false, "", null);
    state.sound_slide_vel = getConfigNumber(ini, section, "slide_velocity", object, false, 7);
  }
}
