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
  npc: XR_game_object,
  stype: ESchemeType,
  section: TSection
): void {
  switch (stype) {
    case ESchemeType.STALKER: {
      SchemeDanger.set_danger(npc, ini, SchemeDanger.SCHEME_SECTION, "danger");
      SchemeGatherItems.set_gather_items(npc, ini, SchemeGatherItems.SCHEME_SECTION, "gather_items");

      const combat_section = getConfigString(ini, section, "on_combat", npc, false, "");

      SchemeCombat.set_combat_checker(npc, ini, EScheme.COMBAT, combat_section);

      reset_invulnerability(npc, ini, section);

      const info_section: Optional<string> = getConfigString(ini, section, "info", npc, false, "");

      if (info_section !== null) {
        setObjectInfo(npc, ini, info_section);
      }

      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

      if (hit_section !== null) {
        SchemeHit.set_hit_checker(npc, ini, SchemeHit.SCHEME_SECTION, hit_section);
      }

      /*
       * Originally unused.
       *
      const actor_dialogs_section = getConfigString(ini, section, "actor_dialogs", npc, false, "");

      if (actor_dialogs_section) {
        ActionSchemeMeet.set_actor_dialogs(npc, ini, "actor_dialogs", actor_dialogs_section);
      }
     */

      const wounded_section = getConfigString(ini, section, "wounded", npc, false, "");

      SchemeWounded.set_wounded(npc, ini, EScheme.WOUNDED, wounded_section);
      SchemeAbuse.set_abuse(npc, ini, EScheme.ABUSE, section);
      SchemeHelpWounded.set_help_wounded(npc, ini, EScheme.HELP_WOUNDED, null);
      SchemeCorpseDetection.set_corpse_detection(npc, ini, EScheme.CORPSE_DETECTION, null);

      const meet_section = getConfigString(ini, section, "meet", npc, false, "");

      SchemeMeet.set_meet(npc, ini, EScheme.MEET, meet_section);

      const death_section = getConfigString(ini, section, "on_death", npc, false, "");

      SchemeDeath.set_death(npc, ini, EScheme.DEATH, death_section);
      SchemeCombatIgnore.set_combat_ignore_checker(npc, ini, EScheme.COMBAT_IGNORE);
      SchemeReachTask.set_reach_task(npc, ini, EScheme.REACH_TASK);

      return;
    }

    case ESchemeType.MONSTER: {
      const combat_section: Optional<string> = getConfigString(ini, section, "on_combat", npc, false, "");

      if (combat_section !== null) {
        SchemeMobCombat.set_scheme(npc, ini, EScheme.MOB_COMBAT, combat_section);
      }

      const death_section: Optional<string> = getConfigString(ini, section, "on_death", npc, false, "");

      if (death_section !== null) {
        SchemeMobDeath.set_scheme(npc, ini, EScheme.MOB_DEATH, death_section);
      }

      reset_invulnerability(npc, ini, section);

      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

      if (hit_section !== null) {
        SchemeHit.set_hit_checker(npc, ini, SchemeHit.SCHEME_SECTION, hit_section);
      }

      SchemeCombatIgnore.set_combat_ignore_checker(npc, ini, EScheme.COMBAT_IGNORE);

      return;
    }

    case ESchemeType.ITEM: {
      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

      if (hit_section !== null) {
        SchemePhysicalOnHit.set_scheme(npc, ini, SchemePhysicalOnHit.SCHEME_SECTION, hit_section);
      }

      return;
    }

    case ESchemeType.HELI: {
      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

      if (hit_section !== null) {
        SchemeHit.set_hit_checker(npc, ini, SchemeHit.SCHEME_SECTION, hit_section);
      }

      return;
    }
  }
}
