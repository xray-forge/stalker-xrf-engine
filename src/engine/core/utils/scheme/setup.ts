import { stalker_ids, world_property } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EEvaluatorId, TAbstractSchemeConstructor } from "@/engine/core/schemes";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { disableObjectInvulnerability } from "@/engine/core/utils/object/object_general";
import { ActionBase, ClientObject, EScheme, ESchemeType, LuaArray, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Load scheme implementation into registry.
 * Based on abstract implementation fields define scheme type and name.
 *
 * todo: Throw on duplicate scheme register?
 *
 * @param schemeImplementation - abstract scheme implementation to read definition (name, type)
 * @param schemeNameOverride - name override for schemes, handle cases when 1 scheme can have few names
 */
export function loadSchemeImplementation(
  schemeImplementation: TAbstractSchemeConstructor,
  schemeNameOverride?: EScheme
): void {
  const targetSchemeName: EScheme = schemeNameOverride || schemeImplementation.SCHEME_SECTION;

  logger.info("Loading scheme implementation:", targetSchemeName, ESchemeType[schemeImplementation.SCHEME_TYPE]);

  assert(targetSchemeName, "Invalid scheme name provided: '%s'.", schemeImplementation.SCHEME_SECTION);
  assert(schemeImplementation.SCHEME_TYPE, "Invalid scheme type: '%s'.", schemeImplementation.SCHEME_TYPE);

  registry.schemes.set(schemeNameOverride || schemeImplementation.SCHEME_SECTION, schemeImplementation);
}

/**
 * Load list of schemes at once.
 *
 * @param schemeImplementations - list of schemes for registration
 */
export function loadSchemeImplementations(schemeImplementations: LuaArray<TAbstractSchemeConstructor>): void {
  for (const [, schemeImplementation] of schemeImplementations) {
    loadSchemeImplementation(schemeImplementation);
  }
}

/**
 * Add common preconditions for base action to give priority for other default actions.
 *
 * @param action - action fore preconditions addition
 */
export function addCommonActionPreconditions(action: ActionBase): void {
  action.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
  action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
  action.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));
  action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
  action.add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));
  action.add_precondition(new world_property(stalker_ids.property_items, false));
}

/**
 * Disable object base schemes.
 *
 * todo; Use shared generic to disable schemes by type, probably config based approach for each type.
 *
 * @param object - client object for schemes disabling
 * @param schemeType - type of scheme applied for provided object
 */
export function disableObjectBaseSchemes(object: ClientObject, schemeType: ESchemeType): void {
  switch (schemeType) {
    case ESchemeType.STALKER:
      registry.schemes.get(EScheme.COMBAT).disable(object, EScheme.COMBAT);
      registry.schemes.get(EScheme.HIT).disable(object, EScheme.HIT);
      registry.schemes.get(EScheme.ACTOR_DIALOGS).disable(object, EScheme.ACTOR_DIALOGS);
      registry.schemes.get(EScheme.COMBAT_IGNORE).disable(object, EScheme.COMBAT_IGNORE);

      disableObjectInvulnerability(object);

      return;

    case ESchemeType.MONSTER:
      registry.schemes.get(EScheme.MOB_COMBAT).disable(object, EScheme.MOB_COMBAT);
      registry.schemes.get(EScheme.COMBAT_IGNORE).disable(object, EScheme.COMBAT_IGNORE);
      disableObjectInvulnerability(object);

      return;

    case ESchemeType.ITEM:
      registry.schemes.get(EScheme.PH_ON_HIT).disable(object, EScheme.PH_ON_HIT);

      return;

    case ESchemeType.HELI:
      registry.schemes.get(EScheme.HIT).disable(object, EScheme.HIT);

      return;
  }
}

/**
 * Reset scheme for provided object.
 *
 * @param scheme - scheme implementation name
 * @param object - client object for scheme reset
 * @param schemeToSwitch - ???
 * @param state - client object registry state
 * @param section - ???
 */
export function resetScheme(
  scheme: EScheme,
  object: ClientObject,
  schemeToSwitch: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  const schemeImplementation: Optional<TAbstractSchemeConstructor> = registry.schemes.get(scheme);

  assert(schemeImplementation, "Could not find implementation for provided scheme: '%s'.", scheme);

  schemeImplementation.reset(object, schemeToSwitch, state, section);
}
