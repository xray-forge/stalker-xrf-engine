import { XR_game_object } from "xray16";

import { EScheme, ESchemeType } from "@/engine/lib/types/scheme";
import { SchemeCombat } from "@/engine/scripts/core/schemes/combat/SchemeCombat";
import { SchemeCombatIgnore } from "@/engine/scripts/core/schemes/combat_ignore/SchemeCombatIgnore";
import { SchemeHit } from "@/engine/scripts/core/schemes/hit/SchemeHit";
import { SchemeMeet } from "@/engine/scripts/core/schemes/meet/SchemeMeet";
import { SchemeMobCombat } from "@/engine/scripts/core/schemes/mob/combat/SchemeMobCombat";
import { SchemePhysicalOnHit } from "@/engine/scripts/core/schemes/ph_on_hit/SchemePhysicalOnHit";
import { disableInvulnerability } from "@/engine/scripts/utils/alife";

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
      disableInvulnerability(object);

      return;

    case ESchemeType.MONSTER:
      SchemeMobCombat.disableScheme(object, EScheme.MOB_COMBAT);
      SchemeCombatIgnore.disableScheme(object, EScheme.COMBAT_IGNORE);
      disableInvulnerability(object);

      return;

    case ESchemeType.ITEM:
      SchemePhysicalOnHit.disableScheme(object, SchemePhysicalOnHit.SCHEME_SECTION);

      return;

    case ESchemeType.HELI:
      SchemeHit.disableScheme(object, SchemeHit.SCHEME_SECTION);

      return;
  }
}
