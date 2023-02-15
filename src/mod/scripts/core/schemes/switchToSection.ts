import { XR_game_object, XR_ini_file } from "xray16";

import { Maybe, TSection } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { activateBySection } from "@/mod/scripts/core/schemes/activateBySection";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function switchToSection(object: XR_game_object, ini: XR_ini_file, section: TSection): boolean {
  if (section === "" || section === null) {
    return false;
  }

  const state: IStoredObject = storage.get(object.id());
  const activeSection: Maybe<TSection> = state.active_section;

  if (activeSection === section) {
    return false;
  }

  if (activeSection) {
    issueEvent(object, state[activeSection], "deactivate", object);
  }

  state.exit_from_smartcover_initialized = null;
  state.active_section = null;
  state.active_scheme = null;

  activateBySection(object, ini, section, state.gulag_name, false);

  return true;
}
