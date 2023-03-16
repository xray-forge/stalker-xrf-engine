import { XR_game_object } from "xray16";

import { EScheme, ESchemeType } from "@/mod/lib/types/scheme";
import { SchemeCombat } from "@/mod/scripts/core/scheme/combat/SchemeCombat";
import { SchemeCombatIgnore } from "@/mod/scripts/core/scheme/combat_ignore/SchemeCombatIgnore";
import { SchemeHit } from "@/mod/scripts/core/scheme/hit/SchemeHit";
import { SchemeMeet } from "@/mod/scripts/core/scheme/meet/SchemeMeet";
import { SchemeMobCombat } from "@/mod/scripts/core/scheme/mob/combat/SchemeMobCombat";
import { SchemePhysicalOnHit } from "@/mod/scripts/core/scheme/ph_on_hit/SchemePhysicalOnHit";
import { disableInvulnerability } from "@/mod/scripts/utils/alife";

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
