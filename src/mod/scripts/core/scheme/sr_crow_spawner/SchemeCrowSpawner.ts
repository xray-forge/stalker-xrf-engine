import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/scheme/base";
import { CrowSpawnerManager } from "@/mod/scripts/core/scheme/sr_crow_spawner/CrowSpawnerManager";
import { ISchemeCrowSpawnerState } from "@/mod/scripts/core/scheme/sr_crow_spawner/ISchemeCrowSpawnerState";
import { subscribeActionForEvents } from "@/mod/scripts/core/scheme/subscribeActionForEvents";
import { getConfigNumber, getConfigString, getConfigSwitchConditions } from "@/mod/scripts/utils/config";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseNames } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCrowSpawner extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_CROW_SPAWNER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCrowSpawnerState
  ): void {
    subscribeActionForEvents(object, state, new CrowSpawnerManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeCrowSpawnerState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.max_crows_on_level = getConfigNumber(ini, section, "max_crows_on_level", object, false, 16);

    const path = getConfigString(ini, section, "spawn_path", object, false, "", null);

    state.path_table = parseNames(path!);
  }
}
