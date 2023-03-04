import { XR_game_object, XR_ini_file } from "xray16";

import { Maybe, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { activateBySection } from "@/mod/scripts/core/schemes/activateBySection";
import { issueSchemeEvent } from "@/mod/scripts/core/schemes/issueSchemeEvent";

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

  const state: IStoredObject = registry.objects.get(object.id());
  const activeSection: Maybe<TSection> = state.active_section;

  if (activeSection === section) {
    return false;
  }

  if (activeSection) {
    issueSchemeEvent(object, state[activeSection], "deactivate", object);
  }

  state.exit_from_smartcover_initialized = null;
  state.active_section = null;
  state.active_scheme = null;

  activateBySection(object, ini, section, state.gulag_name, false);

  return true;
}
