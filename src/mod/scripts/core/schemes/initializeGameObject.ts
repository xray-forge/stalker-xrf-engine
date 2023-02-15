import { game_object, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ESchemeType, TSection } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { activateBySection } from "@/mod/scripts/core/schemes/activateBySection";
import { configureSchemes } from "@/mod/scripts/core/schemes/configureSchemes";
import { determine_section_to_activate } from "@/mod/scripts/core/schemes/determine_section_to_activate";
import { get_customdata_or_ini_file } from "@/mod/scripts/core/schemes/get_customdata_or_ini_file";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("initializeObject");

/**
 * todo;
 * todo;
 * todo;
 */
export function initializeGameObject(
  object: XR_game_object,
  state: IStoredObject,
  isLoaded: boolean,
  actor: XR_game_object,
  stype: ESchemeType
): void {
  logger.info("Initialize object:", object.name(), ESchemeType[stype], isLoaded);

  if (!isLoaded) {
    const ini_filename: string = "<customdata>";
    const ini: XR_ini_file = configureSchemes(
      object,
      get_customdata_or_ini_file(object, ini_filename),
      ini_filename,
      stype,
      "logic",
      ""
    );

    const section: TSection = determine_section_to_activate(object, ini, "logic", actor);

    activateBySection(object, ini, section, state.gulag_name, false);

    const relation = getConfigString(ini, "logic", "relation", object, false, "");

    if (relation !== null) {
      // todo: NO index of global?
      object.set_relation((game_object as any)[relation], getActor()!);
    }

    const sympathy = getConfigNumber(ini, "logic", "sympathy", object, false);

    if (sympathy !== null) {
      object.set_sympathy(sympathy);
    }
  } else {
    const ini_filename: Optional<string> = state.loaded_ini_filename;

    if (ini_filename !== null) {
      let ini: XR_ini_file = get_customdata_or_ini_file(object, ini_filename);

      ini = configureSchemes(object, ini, ini_filename, stype, state.loaded_section_logic, state.loaded_gulag_name);
      activateBySection(object, ini, state.loaded_active_section, state.loaded_gulag_name, true);
    }
  }
}
