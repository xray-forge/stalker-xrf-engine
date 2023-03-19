import { XR_game_object } from "xray16";

import { SchemeCombat } from "@/engine/core/schemes/combat/SchemeCombat";
import { SchemeCombatIgnore } from "@/engine/core/schemes/combat_ignore/SchemeCombatIgnore";
import { SchemeHit } from "@/engine/core/schemes/hit/SchemeHit";
import { SchemeMeet } from "@/engine/core/schemes/meet/SchemeMeet";
import { SchemeMobCombat } from "@/engine/core/schemes/mob/combat/SchemeMobCombat";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/ph_on_hit/SchemePhysicalOnHit";
import { disableObjectInvulnerability } from "@/engine/core/utils/object";
import { EScheme, ESchemeType } from "@/engine/lib/types/scheme";

/**
 * todo;
 * todo;
 * todo; Use shared generic to disable schemes by type.
 */
export function disableGenericSchemes(object: XR_game_object, schemeType: ESchemeType): void {
  switch (schemeType) {
    case ESchemeType.STALKER:
      SchemeCombat.disableScheme(object, EScheme.COMBAT);
      SchemeHit.disableScheme(object, SchemeHit.SCHEME_SECTION);
      SchemeMeet.disableScheme(object, EScheme.ACTOR_DIALOGS);
      SchemeCombatIgnore.disableScheme(object, EScheme.COMBAT_IGNORE);
      disableObjectInvulnerability(object);

      return;

    case ESchemeType.MONSTER:
      SchemeMobCombat.disableScheme(object, EScheme.MOB_COMBAT);
      SchemeCombatIgnore.disableScheme(object, EScheme.COMBAT_IGNORE);
      disableObjectInvulnerability(object);

      return;

    case ESchemeType.ITEM:
      SchemePhysicalOnHit.disableScheme(object, SchemePhysicalOnHit.SCHEME_SECTION);

      return;

    case ESchemeType.HELI:
      SchemeHit.disableScheme(object, SchemeHit.SCHEME_SECTION);

      return;
  }
}
