import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IRegistryObjectState } from "@/mod/scripts/core/database";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { DeathManager } from "@/mod/scripts/core/schemes/death/DeathManager";
import { ISchemeDeathState } from "@/mod/scripts/core/schemes/death/ISchemeDeathState";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { getConfigString } from "@/mod/scripts/utils/config";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseConditionsList } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeDeathState
  ): void {
    subscribeActionForEvents(object, state, new DeathManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    AbstractScheme.assignStateAndBind(object, ini, scheme, section);
  }

  /**
   * todo;
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    objectState: IRegistryObjectState,
    section: TSection
  ): void {
    const deathSection: Optional<TSection> = getConfigString(
      objectState.ini!,
      objectState.section_logic,
      "on_death",
      object,
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
      const onInfo: Optional<string> = getConfigString(
        objectState.ini!,
        deathSection,
        "on_info",
        object,
        false,
        "",
        null
      );

      if (onInfo !== null) {
        state!.info = parseConditionsList(object, deathSection, "death", onInfo);
      }

      const onInfo2: Optional<string> = getConfigString(
        objectState.ini!,
        deathSection,
        "on_info2",
        object,
        false,
        "",
        null
      );

      if (onInfo2 !== null) {
        state!.info2 = parseConditionsList(object, deathSection, "death", onInfo2);
      }
    }
  }
}
