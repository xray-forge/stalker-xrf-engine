import { AbstractScheme } from "@/engine/core/ai/scheme";
import { CrowSpawnerManager } from "@/engine/core/schemes/restrictor/sr_crow_spawner/CrowSpawnerManager";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/restrictor/sr_crow_spawner/sr_crow_spawner_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseStringsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, GameObject, IniFile, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing logics of crow spawning for restrictors.
 * From time to time spawns crows and assigns them to specific paths.
 */
export class SchemeCrowSpawner extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_CROW_SPAWNER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeCrowSpawnerState {
    const state: ISchemeCrowSpawnerState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.maxCrowsOnLevel = readIniNumber(ini, section, "max_crows_on_level", false, 16);
    state.pathsList = parseStringsList(readIniString<TName>(ini, section, "spawn_path", false, null, ""));

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCrowSpawnerState
  ): void {
    AbstractScheme.subscribe(state, new CrowSpawnerManager(object, state));
  }
}
