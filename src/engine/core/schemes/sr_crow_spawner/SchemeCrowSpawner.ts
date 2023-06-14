import { AbstractScheme } from "@/engine/core/schemes/base";
import { CrowSpawnerManager } from "@/engine/core/schemes/sr_crow_spawner/CrowSpawnerManager";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/sr_crow_spawner/ISchemeCrowSpawnerState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { parseStringsList } from "@/engine/core/utils/ini/parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, Optional, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCrowSpawner extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_CROW_SPAWNER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeCrowSpawnerState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.maxCrowsOnLevel = readIniNumber(ini, section, "max_crows_on_level", false, 16);

    const path: Optional<TName> = readIniString(ini, section, "spawn_path", false, "", null);

    state.pathsList = parseStringsList(path as TName);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCrowSpawnerState
  ): void {
    SchemeCrowSpawner.subscribe(object, state, new CrowSpawnerManager(object, state));
  }
}
