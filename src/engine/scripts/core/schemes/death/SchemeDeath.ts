import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/engine/lib/types";
import { IRegistryObjectState } from "@/engine/scripts/core/database";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base";
import { DeathManager } from "@/engine/scripts/core/schemes/death/DeathManager";
import { ISchemeDeathState } from "@/engine/scripts/core/schemes/death/ISchemeDeathState";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { abort } from "@/engine/scripts/utils/debug";
import { getConfigString } from "@/engine/scripts/utils/ini_config/getters";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { parseConditionsList } from "@/engine/scripts/utils/parse";

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
        state!.info = parseConditionsList(onInfo);
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
        state!.info2 = parseConditionsList(onInfo2);
      }
    }
  }
}
