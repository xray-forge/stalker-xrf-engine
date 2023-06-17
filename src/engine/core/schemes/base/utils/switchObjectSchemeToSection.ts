import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ESchemeEvent } from "@/engine/core/schemes";
import { activateSchemeBySection } from "@/engine/core/schemes/base/utils/activateSchemeBySection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { emitSchemeEvent } from "@/engine/core/utils/scheme/logic";
import { ClientObject, EScheme, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Explicitly switch object active scheme to new section.
 * Force active scheme to deactivate if it exists and is active.
 *
 * todo: docblock;
 */
export function switchObjectSchemeToSection(object: ClientObject, ini: IniFile, section: Optional<TSection>): boolean {
  if (section === "" || section === null) {
    return false;
  }

  const state: IRegistryObjectState = registry.objects.get(object.id());
  const activeSection: Optional<TSection> = state.active_section as TSection;

  if (activeSection === section) {
    return false;
  }

  // Notify schemes about deactivation.
  if (activeSection !== null) {
    emitSchemeEvent(object, state[state.active_scheme as EScheme]!, ESchemeEvent.DEACTIVATE, object);
  }

  state.active_section = null;
  state.active_scheme = null;

  activateSchemeBySection(object, ini, section, state.gulag_name, false);

  return true;
}
