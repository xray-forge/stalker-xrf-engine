import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { SchemeAbuse } from "@/mod/scripts/core/schemes/abuse/SchemeAbuse";
import { SchemeCombat } from "@/mod/scripts/core/schemes/combat/SchemeCombat";
import { SchemeCombatIgnore } from "@/mod/scripts/core/schemes/combat_ignore/SchemeCombatIgnore";
import { SchemeCorpseDetection } from "@/mod/scripts/core/schemes/corpse_detection/SchemeCorpseDetection";
import { SchemeDanger } from "@/mod/scripts/core/schemes/danger/SchemeDanger";
import { SchemeDeath } from "@/mod/scripts/core/schemes/death/SchemeDeath";
import { SchemeGatherItems } from "@/mod/scripts/core/schemes/gather_items/SchemeGatherItems";
import { SchemeHelpWounded } from "@/mod/scripts/core/schemes/help_wounded/SchemeHelpWounded";
import { SchemeHit } from "@/mod/scripts/core/schemes/hit/SchemeHit";
import { SchemeMeet } from "@/mod/scripts/core/schemes/meet/SchemeMeet";
import { SchemeMobCombat } from "@/mod/scripts/core/schemes/mob/combat/SchemeMobCombat";
import { SchemeMobDeath } from "@/mod/scripts/core/schemes/mob/death/SchemeMobDeath";
import { SchemePhysicalOnHit } from "@/mod/scripts/core/schemes/ph_on_hit/SchemePhysicalOnHit";
import { SchemeReachTask } from "@/mod/scripts/core/schemes/reach_task/SchemeReachTask";
import { SchemeWounded } from "@/mod/scripts/core/schemes/wounded/SchemeWounded";
import { reset_invulnerability, setObjectInfo } from "@/mod/scripts/utils/alife";
import { getConfigString } from "@/mod/scripts/utils/configs";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function enable_generic_schemes(
  ini: XR_ini_file,
  object: XR_game_object,
  schemeType: ESchemeType,
  section: TSection
): void {
  switch (schemeType) {
    case ESchemeType.STALKER: {
      SchemeDanger.set_danger(object, ini, SchemeDanger.SCHEME_SECTION, "danger");
      SchemeGatherItems.set_gather_items(object, ini, SchemeGatherItems.SCHEME_SECTION, "gather_items");

      const combat_section = getConfigString(ini, section, "on_combat", object, false, "");

      SchemeCombat.set_combat_checker(object, ini, EScheme.COMBAT, combat_section);

      reset_invulnerability(object, ini, section);

      const info_section: Optional<string> = getConfigString(ini, section, "info", object, false, "");

      if (info_section !== null) {
        setObjectInfo(object, ini, info_section);
      }

      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", object, false, "");

      if (hit_section !== null) {
        SchemeHit.set_scheme(object, ini, SchemeHit.SCHEME_SECTION, hit_section);
      }

      /*
       * Originally unused.
       *
      const actor_dialogs_section = getConfigString(ini, section, "actor_dialogs", npc, false, "");

      if (actor_dialogs_section) {
        ActionSchemeMeet.set_actor_dialogs(npc, ini, "actor_dialogs", actor_dialogs_section);
      }
     */

      const wounded_section = getConfigString(ini, section, "wounded", object, false, "");

      SchemeWounded.set_wounded(object, ini, EScheme.WOUNDED, wounded_section);
      SchemeAbuse.set_abuse(object, ini, EScheme.ABUSE, section);
      SchemeHelpWounded.set_help_wounded(object, ini, EScheme.HELP_WOUNDED, null);
      SchemeCorpseDetection.set_corpse_detection(object, ini, EScheme.CORPSE_DETECTION, null);

      const meet_section = getConfigString(ini, section, "meet", object, false, "");

      SchemeMeet.set_meet(object, ini, EScheme.MEET, meet_section);

      const death_section = getConfigString(ini, section, "on_death", object, false, "");

      SchemeDeath.set_death(object, ini, EScheme.DEATH, death_section);
      SchemeCombatIgnore.set_combat_ignore_checker(object, ini, EScheme.COMBAT_IGNORE);
      SchemeReachTask.set_reach_task(object, ini, EScheme.REACH_TASK);

      return;
    }

    case ESchemeType.MONSTER: {
      const combat_section: Optional<string> = getConfigString(ini, section, "on_combat", object, false, "");

      if (combat_section !== null) {
        SchemeMobCombat.set_scheme(object, ini, EScheme.MOB_COMBAT, combat_section);
      }

      const death_section: Optional<string> = getConfigString(ini, section, "on_death", object, false, "");

      if (death_section !== null) {
        SchemeMobDeath.set_scheme(object, ini, EScheme.MOB_DEATH, death_section);
      }

      reset_invulnerability(object, ini, section);

      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", object, false, "");

      if (hit_section !== null) {
        SchemeHit.set_scheme(object, ini, SchemeHit.SCHEME_SECTION, hit_section);
      }

      SchemeCombatIgnore.set_combat_ignore_checker(object, ini, EScheme.COMBAT_IGNORE);

      return;
    }

    case ESchemeType.ITEM: {
      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", object, false, "");

      if (hit_section !== null) {
        SchemePhysicalOnHit.set_scheme(object, ini, SchemePhysicalOnHit.SCHEME_SECTION, hit_section);
      }

      return;
    }

    case ESchemeType.HELI: {
      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", object, false, "");

      if (hit_section !== null) {
        SchemeHit.set_scheme(object, ini, SchemeHit.SCHEME_SECTION, hit_section);
      }

      return;
    }
  }
}
