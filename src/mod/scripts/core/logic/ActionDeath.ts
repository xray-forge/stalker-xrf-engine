import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { assign_storage_and_bind, subscribe_action_for_events } from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { getConfigString, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionDeath");

export class ActionDeath extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "death";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    subscribe_action_for_events(object, state, new ActionDeath(object, state));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    additional: string
  ): void {
    abort("Called not implemented set_scheme method: %s, %s", object.name(), scheme);
  }

  public static set_death(object: XR_game_object, ini: XR_ini_file, scheme: TScheme, section: TSection): void {
    logger.info("Set death:", object.name());
    assign_storage_and_bind(object, ini, scheme, section);
  }

  public static reset_death(object: XR_game_object, scheme: TScheme, state: IStoredObject, section: TSection): void {
    const death_section: Optional<string> = getConfigString(
      state.ini!,
      state.section_logic!,
      "on_death",
      object,
      false,
      "",
      null
    );

    if (death_section !== null) {
      logger.info("Reset death:", object.name());

      if (!state.ini!.section_exist(death_section)) {
        abort("There is no section [%s] for object [%s]", death_section, object.name());
      }

      const on_info = getConfigString(state.ini!, death_section, "on_info", object, false, "", null);

      if (on_info !== null) {
        state.death!.info = parseCondList(object, death_section, "death", on_info);
      }

      const onInfo2 = getConfigString(state.ini!, death_section, "on_info2", object, false, "", null);

      if (onInfo2 !== null) {
        state.death!.info2 = parseCondList(object, death_section, "death", onInfo2);
      }
    }
  }

  public death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void {
    storage.get(victim.id()).death!.killer = who === null ? -1 : who.id();

    // todo: Does it make sense? No side effects from picking?
    const actor: Optional<XR_game_object> = getActor();

    if (actor) {
      if (this.state.info) {
        pickSectionFromCondList(actor, this.object, this.state.info);
      }

      if (this.state.info2) {
        pickSectionFromCondList(actor, this.object, this.state.info2);
      }
    }
  }
}
