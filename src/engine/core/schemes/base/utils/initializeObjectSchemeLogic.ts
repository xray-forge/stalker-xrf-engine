import { game_object, ini_file } from "xray16";

import { getObjectLogicIniConfig, IRegistryObjectState, registry } from "@/engine/core/database";
import { activateSchemeBySection } from "@/engine/core/schemes/base/utils/activateSchemeBySection";
import { configureObjectSchemes } from "@/engine/core/schemes/base/utils/configureObjectSchemes";
import { getObjectSectionToActivate } from "@/engine/core/schemes/base/utils/getObjectSectionToActivate";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TRelation } from "@/engine/lib/constants/relations";
import { Optional, TCount, TName } from "@/engine/lib/types";
import { ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo;
 * todo;
 */
export function initializeObjectSchemeLogic(
  object: game_object,
  state: IRegistryObjectState,
  isLoaded: boolean,
  actor: game_object,
  schemeType: ESchemeType
): void {
  logger.info("Initialize object:", object.name(), ESchemeType[schemeType], isLoaded);

  if (!isLoaded) {
    const iniFilename: TName = "<customdata>";
    const iniFile: ini_file = configureObjectSchemes(
      object,
      getObjectLogicIniConfig(object, iniFilename),
      iniFilename,
      schemeType,
      "logic",
      ""
    );

    const section: TSection = getObjectSectionToActivate(object, iniFile, "logic", actor);

    activateSchemeBySection(object, iniFile, section, state.gulag_name, false);

    const relation: Optional<TRelation> = readIniString(iniFile, "logic", "relation", false, "") as TRelation;

    if (relation !== null) {
      object.set_relation(game_object[relation as TRelation], registry.actor);
    }

    const sympathy: Optional<TCount> = readIniNumber(iniFile, "logic", "sympathy", false);

    if (sympathy !== null) {
      object.set_sympathy(sympathy);
    }
  } else {
    const iniFilename: Optional<TName> = state.loaded_ini_filename;

    if (iniFilename !== null) {
      const iniFile: ini_file = configureObjectSchemes(
        object,
        getObjectLogicIniConfig(object, iniFilename),
        iniFilename,
        schemeType,
        state.loaded_section_logic as TSection,
        state.loaded_gulag_name
      );

      activateSchemeBySection(object, iniFile, state.loaded_active_section as TSection, state.loaded_gulag_name, true);
    }
  }
}
