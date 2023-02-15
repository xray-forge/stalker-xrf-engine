import { XR_game_object } from "xray16";

import { EScheme, ESchemeType } from "@/mod/lib/types/scheme";
import { ActionOnHit } from "@/mod/scripts/core/logic/ActionOnHit";
import { ActionProcessHit } from "@/mod/scripts/core/logic/ActionProcessHit";
import { ActionSchemeCombat } from "@/mod/scripts/core/logic/ActionSchemeCombat";
import { ActionSchemeCombatIgnore } from "@/mod/scripts/core/logic/ActionSchemeCombatIgnore";
import { ActionSchemeMeet } from "@/mod/scripts/core/logic/ActionSchemeMeet";
import { ActionMobCombat } from "@/mod/scripts/core/logic/mob/ActionMobCombat";
import { disable_invulnerability } from "@/mod/scripts/utils/alife";

/**
 * todo;
 * todo;
 * todo; Use shared generic to disable schemes by type.
 */
export function disableGenericSchemes(object: XR_game_object, schemeType: ESchemeType): void {
  switch (schemeType) {
    case ESchemeType.STALKER:
      ActionSchemeCombat.disable_scheme(object, EScheme.COMBAT);
      ActionProcessHit.disable_scheme(object, ActionProcessHit.SCHEME_SECTION);
      ActionSchemeMeet.disable_scheme(object, EScheme.ACTOR_DIALOGS);
      ActionSchemeCombatIgnore.disable_scheme(object, EScheme.COMBAT_IGNORE);
      disable_invulnerability(object);

      return;

    case ESchemeType.MONSTER:
      ActionMobCombat.disable_scheme(object, EScheme.MOB_COMBAT);
      ActionSchemeCombatIgnore.disable_scheme(object, EScheme.COMBAT_IGNORE);
      disable_invulnerability(object);

      return;

    case ESchemeType.ITEM:
      ActionOnHit.disable_scheme(object, ActionOnHit.SCHEME_SECTION);

      return;

    case ESchemeType.HELI:
      ActionProcessHit.disable_scheme(object, ActionProcessHit.SCHEME_SECTION);

      return;
  }
}
