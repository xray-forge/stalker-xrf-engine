import { XR_game_object } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { TAbstractSchemeConstructor } from "@/engine/core/schemes/base/AbstractScheme";
import { abort } from "@/engine/core/utils/debug";
import { AnyObject, Optional } from "@/engine/lib/types";
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
