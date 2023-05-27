import { getMonsterState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeMobHomeState } from "@/engine/core/schemes/mob/home/ISchemeMobHomeState";
import { MobHomeManager } from "@/engine/core/schemes/mob/home/MobHomeManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobHome extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_HOME;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo: Description.
   */
  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    gulagName: TName
  ): void {
    logger.info("Set scheme:", object.name(), scheme, section);

    const state: ISchemeMobHomeState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.state = getMonsterState(ini, section);
    state.home = readIniString(ini, section, "path_home", false, gulagName, null);
    state.gulag_point = readIniBoolean(ini, section, "gulag_point", false, false);
    state.home_min_radius = readIniNumber(ini, section, "home_min_radius", false); // --, 20)
    state.home_mid_radius = readIniNumber(ini, section, "home_mid_radius", false); // --, 0)
    state.home_max_radius = readIniNumber(ini, section, "home_max_radius", false); // --, 40)
    state.aggressive = readIniBoolean(ini, section, "aggressive", false, false);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobHomeState
  ): void {
    SchemeMobHome.subscribe(object, state, new MobHomeManager(object, state));
  }
}
