import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeMobHomeState } from "@/engine/core/schemes/mob/home/ISchemeMobHomeState";
import { MobHomeManager } from "@/engine/core/schemes/mob/home/MobHomeManager";
import { getMobState } from "@/engine/core/schemes/mob/MobStateManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobHome extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_HOME;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobHomeState
  ): void {
    subscribeActionForEvents(object, state, new MobHomeManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulagName: TName
  ): void {
    logger.info("Set scheme:", object.name(), scheme, section);

    const state: ISchemeMobHomeState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.state = getMobState(ini, section, object);
    state.home = getConfigString(ini, section, "path_home", object, false, gulagName, null);
    state.gulag_point = getConfigBoolean(ini, section, "gulag_point", object, false, false);
    state.home_min_radius = getConfigNumber(ini, section, "home_min_radius", object, false); // --, 20)
    state.home_mid_radius = getConfigNumber(ini, section, "home_mid_radius", object, false); // --, 0)
    state.home_max_radius = getConfigNumber(ini, section, "home_max_radius", object, false); // --, 40)
    state.aggressive = getConfigBoolean(ini, section, "aggressive", object, false, false);
  }
}
