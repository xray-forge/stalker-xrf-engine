import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death/death_types";
import { DeathManager } from "@/engine/core/schemes/stalker/death/DeathManager";
import { abort } from "@/engine/core/utils/assertion";
import { parseConditionsList, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme defining events that should happen when stalker object dies.
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
    AbstractScheme.subscribe(state, new DeathManager(object, state));
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    objectState: IRegistryObjectState,
    section: TSection
  ): void {
    const deathSection: Optional<TSection> = readIniString(objectState.ini, objectState.sectionLogic, "on_death");

    if (deathSection) {
      logger.info("Reset death: %s", object.name());

      if (!objectState.ini.section_exist(deathSection)) {
        abort("There is no section '%s' for object '%s'.", deathSection, object.name());
      }

      const state: ISchemeDeathState = objectState[SchemeDeath.SCHEME_SECTION] as ISchemeDeathState;
      const onInfo: Optional<string> = readIniString(objectState.ini, deathSection, "on_info");

      if (onInfo) {
        state.info = parseConditionsList(onInfo);
      }

      const onInfo2: Optional<string> = readIniString(objectState.ini, deathSection, "on_info2");

      if (onInfo2) {
        state.info2 = parseConditionsList(onInfo2);
      }
    }
  }
}
