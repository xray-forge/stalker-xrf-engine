import { game_object, XR_game_object, XR_ini_file } from "xray16";

import { Optional, TName } from "@/engine/lib/types";
import { ESchemeType, TSection } from "@/engine/lib/types/scheme";
import { IRegistryObjectState, registry } from "@/engine/scripts/core/database";
import { activateSchemeBySection } from "@/engine/scripts/core/schemes/base/activateSchemeBySection";
import { configureObjectSchemes } from "@/engine/scripts/core/schemes/base/configureObjectSchemes";
import { determine_section_to_activate } from "@/engine/scripts/core/schemes/determine_section_to_activate";
import { getCustomDataOrIniFile } from "@/engine/scripts/core/schemes/getCustomDataOrIniFile";
import { getConfigNumber, getConfigString } from "@/engine/scripts/utils/ini_config/getters";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo;
 * todo;
 */
export function initializeGameObject(
  object: XR_game_object,
  state: IRegistryObjectState,
  isLoaded: boolean,
  actor: XR_game_object,
  schemeType: ESchemeType
): void {
  logger.info("Initialize game object:", object.name(), ESchemeType[schemeType], isLoaded);

  if (!isLoaded) {
    const iniFilename: TName = "<customdata>";
    const iniFile: XR_ini_file = configureObjectSchemes(
      object,
      getCustomDataOrIniFile(object, iniFilename),
      iniFilename,
      schemeType,
      "logic",
      ""
    );

    const section: TSection = determine_section_to_activate(object, iniFile, "logic", actor);

    activateSchemeBySection(object, iniFile, section, state.gulag_name, false);

    const relation = getConfigString(iniFile, "logic", "relation", object, false, "");

    if (relation !== null) {
      // todo: NO index of global?
      object.set_relation((game_object as any)[relation], registry.actor);
    }

    const sympathy = getConfigNumber(iniFile, "logic", "sympathy", object, false);

    if (sympathy !== null) {
      object.set_sympathy(sympathy);
    }
  } else {
    const iniFilename: Optional<string> = state.loaded_ini_filename;

    if (iniFilename !== null) {
      let iniFile: XR_ini_file = getCustomDataOrIniFile(object, iniFilename);

      iniFile = configureObjectSchemes(
        object,
        iniFile,
        iniFilename,
        schemeType,
        state.loaded_section_logic as TSection,
        state.loaded_gulag_name
      );
      activateSchemeBySection(object, iniFile, state.loaded_active_section as TSection, state.loaded_gulag_name, true);
    }
  }
}
