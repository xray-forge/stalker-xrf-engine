import { XR_game_object } from "xray16";

import { EScheme, ESchemeType } from "@/mod/lib/types/configuration";
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
 * todo;
 */
export function disable_generic_schemes(npc: XR_game_object, stype: ESchemeType): void {
  switch (stype) {
    case ESchemeType.STALKER:
      ActionSchemeCombat.disable_scheme(npc, EScheme.COMBAT);
      ActionProcessHit.disable_scheme(npc, ActionProcessHit.SCHEME_SECTION);
      ActionSchemeMeet.disable_scheme(npc, EScheme.ACTOR_DIALOGS);
      ActionSchemeCombatIgnore.disable_scheme(npc, EScheme.COMBAT_IGNORE);
      disable_invulnerability(npc);

      return;

    case ESchemeType.MOBILE:
      ActionMobCombat.disable_scheme(npc, EScheme.MOB_COMBAT);
      ActionSchemeCombatIgnore.disable_scheme(npc, EScheme.COMBAT_IGNORE);
      disable_invulnerability(npc);

      return;

    case ESchemeType.ITEM:
      ActionOnHit.disable_scheme(npc, ActionOnHit.SCHEME_SECTION);

      return;

    case ESchemeType.HELI:
      ActionProcessHit.disable_scheme(npc, ActionProcessHit.SCHEME_SECTION);

      return;
  }
}
