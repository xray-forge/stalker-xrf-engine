import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { ISchemeMonsterState } from "@/mod/scripts/core/schemes/sr_monster/ISchemeMonsterState";
import { MonsterManager } from "@/mod/scripts/core/schemes/sr_monster/MonsterManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { getConfigNumber, getConfigString, getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseNames } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger("SchemeMonster");

/**
 * todo;
 */
export class SchemeMonster extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_MONSTER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo;
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
   * todo;
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
