import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { SchemeAbuse } from "@/mod/scripts/core/scheme/abuse/SchemeAbuse";
import { SchemeCombat } from "@/mod/scripts/core/scheme/combat/SchemeCombat";
import { SchemeCombatIgnore } from "@/mod/scripts/core/scheme/combat_ignore/SchemeCombatIgnore";
import { SchemeCorpseDetection } from "@/mod/scripts/core/scheme/corpse_detection/SchemeCorpseDetection";
import { SchemeDanger } from "@/mod/scripts/core/scheme/danger/SchemeDanger";
import { SchemeDeath } from "@/mod/scripts/core/scheme/death/SchemeDeath";
import { SchemeGatherItems } from "@/mod/scripts/core/scheme/gather_items/SchemeGatherItems";
import { SchemeHelpWounded } from "@/mod/scripts/core/scheme/help_wounded/SchemeHelpWounded";
import { SchemeHit } from "@/mod/scripts/core/scheme/hit/SchemeHit";
import { SchemeMeet } from "@/mod/scripts/core/scheme/meet/SchemeMeet";
import { SchemeMobCombat } from "@/mod/scripts/core/scheme/mob/combat/SchemeMobCombat";
import { SchemeMobDeath } from "@/mod/scripts/core/scheme/mob/death/SchemeMobDeath";
import { SchemePhysicalOnHit } from "@/mod/scripts/core/scheme/ph_on_hit/SchemePhysicalOnHit";
import { SchemeReachTask } from "@/mod/scripts/core/scheme/reach_task/SchemeReachTask";
import { SchemeWounded } from "@/mod/scripts/core/scheme/wounded/SchemeWounded";
import { resetInvulnerability, setObjectInfo } from "@/mod/scripts/utils/alife";
import { getConfigString } from "@/mod/scripts/utils/config";

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
      SchemeDanger.setScheme(object, ini, SchemeDanger.SCHEME_SECTION, "danger");
      SchemeGatherItems.setGatherItems(object, ini, SchemeGatherItems.SCHEME_SECTION, "gather_items");

      const combatSection: TSection = getConfigString(ini, section, "on_combat", object, false, "");

      SchemeCombat.setCombatChecker(object, ini, EScheme.COMBAT, combatSection);

      resetInvulnerability(object);

      const infoSection: Optional<TSection> = getConfigString(ini, section, "info", object, false, "");

      if (infoSection !== null) {
        setObjectInfo(object, ini, infoSection);
      }

      const hitSection: Optional<string> = getConfigString(ini, section, "on_hit", object, false, "");

      if (hitSection !== null) {
        SchemeHit.setScheme(object, ini, SchemeHit.SCHEME_SECTION, hitSection);
      }

      /*
       * Originally unused.
       *
      const actor_dialogs_section = getConfigString(ini, section, "actor_dialogs", npc, false, "");

      if (actor_dialogs_section) {
        ActionSchemeMeet.set_actor_dialogs(npc, ini, "actor_dialogs", actor_dialogs_section);
      }
     */

      const woundedSection: TSection = getConfigString(ini, section, "wounded", object, false, "");

      SchemeWounded.setScheme(object, ini, EScheme.WOUNDED, woundedSection);
      SchemeAbuse.setScheme(object, ini, EScheme.ABUSE, section);
      SchemeHelpWounded.setHelpWounded(object, ini, EScheme.HELP_WOUNDED, null);
      SchemeCorpseDetection.setCorpseDetection(object, ini, EScheme.CORPSE_DETECTION, null);

      const meetSection: TSection = getConfigString(ini, section, "meet", object, false, "");

      SchemeMeet.setScheme(object, ini, EScheme.MEET, meetSection);

      const deathSection: TSection = getConfigString(ini, section, "on_death", object, false, "");

      SchemeDeath.setScheme(object, ini, EScheme.DEATH, deathSection);
      SchemeCombatIgnore.setCombatIgnoreChecker(object, ini, EScheme.COMBAT_IGNORE);
      SchemeReachTask.setScheme(object, ini, EScheme.REACH_TASK);

      return;
    }

    case ESchemeType.MONSTER: {
      const combatSection: Optional<TSection> = getConfigString(ini, section, "on_combat", object, false, "");

      if (combatSection !== null) {
        SchemeMobCombat.setScheme(object, ini, EScheme.MOB_COMBAT, combatSection);
      }

      const deathSection: Optional<TSection> = getConfigString(ini, section, "on_death", object, false, "");

      if (deathSection !== null) {
        SchemeMobDeath.setScheme(object, ini, EScheme.MOB_DEATH, deathSection);
      }

      resetInvulnerability(object);

      const hitSection: Optional<TSection> = getConfigString(ini, section, "on_hit", object, false, "");

      if (hitSection !== null) {
        SchemeHit.setScheme(object, ini, SchemeHit.SCHEME_SECTION, hitSection);
      }

      SchemeCombatIgnore.setCombatIgnoreChecker(object, ini, EScheme.COMBAT_IGNORE);

      return;
    }

    case ESchemeType.ITEM: {
      const hitSection: Optional<TSection> = getConfigString(ini, section, "on_hit", object, false, "");

      if (hitSection !== null) {
        SchemePhysicalOnHit.setScheme(object, ini, SchemePhysicalOnHit.SCHEME_SECTION, hitSection);
      }

      return;
    }

    case ESchemeType.HELI: {
      const hitSection: Optional<TSection> = getConfigString(ini, section, "on_hit", object, false, "");

      if (hitSection !== null) {
        SchemeHit.setScheme(object, ini, SchemeHit.SCHEME_SECTION, hitSection);
      }

      return;
    }
  }
}
