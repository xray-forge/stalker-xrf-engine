import { XR_game_object } from "xray16";

import { AnyObject, Optional } from "@/mod/lib/types";
import { EScheme, TSection } from "@/mod/lib/types/scheme";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { TAbstractSchemeConstructor } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { abort } from "@/mod/scripts/utils/debug";

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
    schemeImplementation.resetScheme(object, schemeToSwitch, state, section);
  } else {
    abort("Could not find implementation for provided scheme: '%s'.", scheme);
  }
}

/**
 * todo; Dirty.
 */
export function resetSchemeHard(scheme: EScheme): void {
  const schemeImplementation: Optional<TAbstractSchemeConstructor> = registry.schemes.get(scheme);

  // Do not pass params and just do it hard way.
  if (schemeImplementation !== null) {
    (schemeImplementation as AnyObject).resetScheme();
  } else {
    abort("Could not find implementation for provided scheme: '%s'.", scheme);
  }
}
