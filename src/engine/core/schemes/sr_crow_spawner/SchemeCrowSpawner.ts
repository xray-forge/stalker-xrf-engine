import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { CrowSpawnerManager } from "@/engine/core/schemes/sr_crow_spawner/CrowSpawnerManager";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/sr_crow_spawner/ISchemeCrowSpawnerState";
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
