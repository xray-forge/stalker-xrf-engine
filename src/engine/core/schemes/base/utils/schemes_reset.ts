import { XR_game_object } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { TAbstractSchemeConstructor } from "@/engine/core/schemes/base/AbstractScheme";
import { abort } from "@/engine/core/utils/assertion";
import { Optional } from "@/engine/lib/types";
import { EScheme, TSection } from "@/engine/lib/types/scheme";

/**
 * todo;
 */
export function resetScheme(
  scheme: EScheme,
  object: XR_game_object,
  schemeToSwitch: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  const schemeImplementation: Optional<TAbstractSchemeConstructor> = registry.schemes.get(scheme);

  if (schemeImplementation !== null) {
    schemeImplementation.reset(object, schemeToSwitch, state, section);
  } else {
    abort("Could not find implementation for provided scheme: '%s'.", scheme);
  }
}
