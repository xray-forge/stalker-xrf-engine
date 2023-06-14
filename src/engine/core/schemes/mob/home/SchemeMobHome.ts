import { getMonsterState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeMobHomeState } from "@/engine/core/schemes/mob/home/ISchemeMobHomeState";
import { MobHomeManager } from "@/engine/core/schemes/mob/home/MobHomeManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme to assign mobs to specific home location and operate only in strict radius range.
 */
export class SchemeMobHome extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_HOME;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    pathPrefix: TName
  ): void {
    logger.info("Activate scheme:", object.name(), scheme, section);

    const state: ISchemeMobHomeState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    state.monsterState = getMonsterState(ini, section);
    state.homeWayPoint = readIniString(ini, section, "path_home", false, pathPrefix, null);

    state.isSmartTerrainPoint = readIniBoolean(ini, section, "gulag_point", false, false);
    state.isAggressive = readIniBoolean(ini, section, "aggressive", false, false);

    state.homeMinRadius = readIniNumber(ini, section, "home_min_radius", false); // --, 20)
    state.homeMidRadius = readIniNumber(ini, section, "home_mid_radius", false); // --, 0)
    state.homeMaxRadius = readIniNumber(ini, section, "home_max_radius", false); // --, 40)
  }

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
