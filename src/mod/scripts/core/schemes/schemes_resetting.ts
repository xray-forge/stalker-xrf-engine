import { XR_game_object } from "xray16";

import { AnyObject, Optional } from "@/mod/lib/types";
import { EScheme, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject, schemes } from "@/mod/scripts/core/db";
import { TAbstractSchemeConstructor } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * todo;
 */
export function resetScheme(
  scheme: EScheme,
  object: XR_game_object,
  schemeToSwitch: EScheme,
  state: IStoredObject,
  section: TSection
): void {
  const schemeImplementation: Optional<TAbstractSchemeConstructor> = schemes.get(scheme);

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
  const schemeImplementation: Optional<TAbstractSchemeConstructor> = schemes.get(scheme);

  if (schemeImplementation !== null) {
    (schemeImplementation as AnyObject).resetScheme();
  } else {
    abort("Could not find implementation for provided scheme: '%s'.", scheme);
  }
}
