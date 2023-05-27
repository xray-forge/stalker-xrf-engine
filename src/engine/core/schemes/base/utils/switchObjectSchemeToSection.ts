import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ESchemeEvent } from "@/engine/core/schemes";
import { activateSchemeBySection } from "@/engine/core/schemes/base/utils/activateSchemeBySection";
import { emitSchemeEvent } from "@/engine/core/schemes/base/utils/emitSchemeEvent";
import { ClientObject, EScheme, IniFile, Maybe, TSection } from "@/engine/lib/types";

/**
 * Explicitly switch object active scheme to new section.
 * Force active scheme to deactivate if it exists and is active.
 *
 * todo: docblock;
 */
export function switchObjectSchemeToSection(object: ClientObject, ini: IniFile, section: TSection): boolean {
  if (section === "" || section === null) {
    return false;
  }

  const state: IRegistryObjectState = registry.objects.get(object.id());
  const activeSection: Maybe<EScheme> = state.active_section as EScheme;

  if (activeSection === section) {
    return false;
  }

  // Notify schemes about deactivation.
  if (activeSection !== null) {
    emitSchemeEvent(object, state[activeSection]!, ESchemeEvent.DEACTIVATE, object);
  }

  state.active_section = null;
  state.active_scheme = null;

  activateSchemeBySection(object, ini, section, state.gulag_name, false);

  return true;
}
