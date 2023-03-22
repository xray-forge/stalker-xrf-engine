import { XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { DeathManager } from "@/engine/core/schemes/death/DeathManager";
import { ISchemeDeathState } from "@/engine/core/schemes/death/ISchemeDeathState";
import { abort } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { EScheme, ESchemeType, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeDeathState
  ): void {
    SchemeDeath.subscribe(object, state, new DeathManager(object, state));
  }

  /**
   * todo: Description.
   */
  public static override reset(
    object: XR_game_object,
    scheme: EScheme,
    objectState: IRegistryObjectState,
    section: TSection
  ): void {
    const deathSection: Optional<TSection> = readIniString(
      objectState.ini!,
      objectState.section_logic,
      "on_death",
      false,
      "",
      null
    );

    if (deathSection !== null) {
      logger.info("Reset death:", object.name());

      if (!objectState.ini!.section_exist(deathSection)) {
        abort("There is no section [%s] for object [%s]", deathSection, object.name());
      }

      const state: ISchemeDeathState = objectState[SchemeDeath.SCHEME_SECTION] as ISchemeDeathState;
      const onInfo: Optional<string> = readIniString(objectState.ini!, deathSection, "on_info", false, "", null);

      if (onInfo !== null) {
        state!.info = parseConditionsList(onInfo);
      }

      const onInfo2: Optional<string> = readIniString(objectState.ini!, deathSection, "on_info2", false, "", null);

      if (onInfo2 !== null) {
        state!.info2 = parseConditionsList(onInfo2);
      }
    }
  }
}
