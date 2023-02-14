import { game_object, XR_game_object, XR_ini_file } from "xray16";

import { ESchemeType } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { activateBySection } from "@/mod/scripts/core/schemes/activateBySection";
import { configureSchemes } from "@/mod/scripts/core/schemes/configureSchemes";
import { determine_section_to_activate } from "@/mod/scripts/core/schemes/determine_section_to_activate";
import { get_customdata_or_ini_file } from "@/mod/scripts/core/schemes/get_customdata_or_ini_file";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";

/**
 * todo;
 * todo;
 * todo;
 */
export function initialize_obj(
  obj: XR_game_object,
  st: IStoredObject,
  loaded: boolean,
  actor: XR_game_object,
  stype: ESchemeType
): void {
  if (!loaded) {
    const ini_filename: string = "<customdata>";
    let ini: XR_ini_file = get_customdata_or_ini_file(obj, ini_filename);

    ini = configureSchemes(obj, ini, ini_filename, stype, "logic", "");

    const sect = determine_section_to_activate(obj, ini, "logic", actor);

    activateBySection(obj, ini, sect, st.gulag_name, false);

    const relation = getConfigString(ini, "logic", "relation", obj, false, "");

    if (relation !== null) {
      // todo: NO index of global?
      obj.set_relation((game_object as any)[relation], getActor()!);
    }

    const sympathy = getConfigNumber(ini, "logic", "sympathy", obj, false);

    if (sympathy !== null) {
      obj.set_sympathy(sympathy);
    }
  } else {
    const ini_filename = st.loaded_ini_filename;

    if (ini_filename) {
      let ini: XR_ini_file = get_customdata_or_ini_file(obj, ini_filename);

      ini = configureSchemes(obj, ini, ini_filename, stype, st.loaded_section_logic, st.loaded_gulag_name);
      activateBySection(obj, ini, st.loaded_active_section, st.loaded_gulag_name, true);
    }
  }
}
