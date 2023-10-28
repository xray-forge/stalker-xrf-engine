import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death/death_types";
import { DeathManager } from "@/engine/core/schemes/stalker/death/DeathManager";
import { abort } from "@/engine/core/utils/assertion";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeDeathState {
    return AbstractScheme.assign(object, ini, scheme, section);
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeDeathState
  ): void {
    AbstractScheme.subscribe(object, state, new DeathManager(object, state));
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    objectState: IRegistryObjectState,
    section: TSection
  ): void {
    const deathSection: Optional<TSection> = readIniString(
      objectState.ini,
      objectState.sectionLogic,
      "on_death",
      false
    );

    if (deathSection !== null) {
      logger.info("Reset death:", object.name());

      if (!objectState.ini.section_exist(deathSection)) {
        abort("There is no section [%s] for object [%s]", deathSection, object.name());
      }

      const state: ISchemeDeathState = objectState[SchemeDeath.SCHEME_SECTION] as ISchemeDeathState;
      const onInfo: Optional<string> = readIniString(objectState.ini, deathSection, "on_info", false);

      if (onInfo !== null) {
        state.info = parseConditionsList(onInfo);
      }

      const onInfo2: Optional<string> = readIniString(objectState.ini, deathSection, "on_info2", false);

      if (onInfo2 !== null) {
        state.info2 = parseConditionsList(onInfo2);
      }
    }
  }
}
