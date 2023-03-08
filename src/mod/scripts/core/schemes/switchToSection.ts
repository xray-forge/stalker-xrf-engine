import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, Maybe, TSection } from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { ESchemeEvent } from "@/mod/scripts/core/schemes/base";
import { activateSchemeBySection } from "@/mod/scripts/core/schemes/base/activateSchemeBySection";
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

  const state: IRegistryObjectState = registry.objects.get(object.id());
  const activeSection: Maybe<EScheme> = state.active_section as EScheme;

  if (activeSection === section) {
    return false;
  }

  if (activeSection !== null) {
    issueSchemeEvent(object, state[activeSection]!, ESchemeEvent.DEACTIVATE, object);
  }

  state.active_section = null;
  state.active_scheme = null;

  activateSchemeBySection(object, ini, section, state.gulag_name, false);

  return true;
}
