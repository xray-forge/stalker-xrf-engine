import { getMonsterState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { ISchemeMobWalkerState } from "@/engine/core/schemes/monster/mob_walker/ISchemeMobWalkerState";
import { MobWalkerManager } from "@/engine/core/schemes/monster/mob_walker/MobWalkerManager";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobWalker extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_WALKER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName: TName
  ): void {
    const state: ISchemeMobWalkerState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.state = getMonsterState(ini, section);
    state.no_reset = readIniBoolean(ini, section, "no_reset", false);
    state.path_walk = readIniString(ini, section, "path_walk", true, smartTerrainName);
    state.path_look = readIniString(ini, section, "path_look", false, smartTerrainName);

    if (state.path_walk === state.path_look) {
      abort(
        "You are trying to set 'path_look' equal to 'path_walk' in section [%s] for object [%s]",
        section,
        object.name()
      );
    }

    state.path_walk_info = null;
    state.path_look_info = null;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobWalkerState
  ): void {
    SchemeMobWalker.subscribe(object, state, new MobWalkerManager(object, state));
  }
}
