import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMobDeathState } from "@/engine/core/schemes/mob/death/ISchemeMobDeathState";
import { MobDeathManager } from "@/engine/core/schemes/mob/death/MobDeathManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeMobDeathState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobDeathState
  ): void {
    SchemeMobDeath.subscribe(object, state, new MobDeathManager(object, state));
  }
}
