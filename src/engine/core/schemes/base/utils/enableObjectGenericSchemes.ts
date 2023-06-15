import { SchemeAbuse } from "@/engine/core/schemes/abuse/SchemeAbuse";
import { SchemeCombat } from "@/engine/core/schemes/combat/SchemeCombat";
import { SchemeCombatIgnore } from "@/engine/core/schemes/combat_ignore/SchemeCombatIgnore";
import { SchemeCorpseDetection } from "@/engine/core/schemes/corpse_detection/SchemeCorpseDetection";
import { SchemeDanger } from "@/engine/core/schemes/danger/SchemeDanger";
import { SchemeDeath } from "@/engine/core/schemes/death/SchemeDeath";
import { SchemeGatherItems } from "@/engine/core/schemes/gather_items/SchemeGatherItems";
import { SchemeHelpWounded } from "@/engine/core/schemes/help_wounded/SchemeHelpWounded";
import { SchemeHit } from "@/engine/core/schemes/hit/SchemeHit";
import { SchemeMeet } from "@/engine/core/schemes/meet/SchemeMeet";
import { SchemeMobCombat } from "@/engine/core/schemes/mob_combat/SchemeMobCombat";
import { SchemeMobDeath } from "@/engine/core/schemes/mob_death/SchemeMobDeath";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/ph_on_hit/SchemePhysicalOnHit";
import { SchemeReachTask } from "@/engine/core/schemes/reach_task/SchemeReachTask";
import { SchemeWounded } from "@/engine/core/schemes/wounded/SchemeWounded";
import { readIniString } from "@/engine/core/utils/ini/read";
import { resetObjectInvulnerability, setObjectInfo } from "@/engine/core/utils/object/object_general";
import { ClientObject, IniFile, Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

/**
 * todo
 * todo
 * todo
 * todo
 */
export function enableObjectGenericSchemes(
  ini: IniFile,
  object: ClientObject,
  schemeType: ESchemeType,
  section: TSection
): void {
  switch (schemeType) {
    case ESchemeType.STALKER: {
      SchemeDanger.activate(object, ini, SchemeDanger.SCHEME_SECTION, "danger");
      SchemeGatherItems.activate(object, ini, SchemeGatherItems.SCHEME_SECTION, "gather_items");

      const combatSection: TSection = readIniString(ini, section, "on_combat", false, "");

      SchemeCombat.activate(object, ini, EScheme.COMBAT, combatSection);

      resetObjectInvulnerability(object);

      const infoSection: Optional<TSection> = readIniString(ini, section, "info", false, "");

      if (infoSection !== null) {
        setObjectInfo(object, ini, infoSection);
      }

      const hitSection: Optional<string> = readIniString(ini, section, "on_hit", false, "");

      if (hitSection !== null) {
        SchemeHit.activate(object, ini, SchemeHit.SCHEME_SECTION, hitSection);
      }

      /*
       * Originally unused.
       *
      const actor_dialogs_section = getConfigString(ini, section, "actor_dialogs", npc, false, "");

      if (actor_dialogs_section) {
        ActionSchemeMeet.set_actor_dialogs(npc, ini, "actor_dialogs", actor_dialogs_section);
      }
     */

      const woundedSection: TSection = readIniString(ini, section, "wounded", false, "");

      SchemeWounded.activate(object, ini, EScheme.WOUNDED, woundedSection);
      SchemeAbuse.activate(object, ini, EScheme.ABUSE, section);
      SchemeHelpWounded.activate(object, ini, EScheme.HELP_WOUNDED, null);
      SchemeCorpseDetection.activate(object, ini, EScheme.CORPSE_DETECTION, null);

      const meetSection: TSection = readIniString(ini, section, "meet", false, "");

      SchemeMeet.activate(object, ini, EScheme.MEET, meetSection);

      const deathSection: TSection = readIniString(ini, section, "on_death", false, "");

      SchemeDeath.activate(object, ini, EScheme.DEATH, deathSection);
      SchemeCombatIgnore.activate(object, ini, EScheme.COMBAT_IGNORE);
      SchemeReachTask.activate(object, ini, EScheme.REACH_TASK);

      return;
    }

    case ESchemeType.MONSTER: {
      const combatSection: Optional<TSection> = readIniString(ini, section, "on_combat", false, "");

      if (combatSection !== null) {
        SchemeMobCombat.activate(object, ini, EScheme.MOB_COMBAT, combatSection);
      }

      const deathSection: Optional<TSection> = readIniString(ini, section, "on_death", false, "");

      if (deathSection !== null) {
        SchemeMobDeath.activate(object, ini, EScheme.MOB_DEATH, deathSection);
      }

      resetObjectInvulnerability(object);

      const hitSection: Optional<TSection> = readIniString(ini, section, "on_hit", false, "");

      if (hitSection !== null) {
        SchemeHit.activate(object, ini, SchemeHit.SCHEME_SECTION, hitSection);
      }

      SchemeCombatIgnore.activate(object, ini, EScheme.COMBAT_IGNORE);

      return;
    }

    case ESchemeType.ITEM: {
      const hitSection: Optional<TSection> = readIniString(ini, section, "on_hit", false, "");

      if (hitSection !== null) {
        SchemePhysicalOnHit.activate(object, ini, SchemePhysicalOnHit.SCHEME_SECTION, hitSection);
      }

      return;
    }

    case ESchemeType.HELI: {
      const hitSection: Optional<TSection> = readIniString(ini, section, "on_hit", false, "");

      if (hitSection !== null) {
        SchemeHit.activate(object, ini, SchemeHit.SCHEME_SECTION, hitSection);
      }

      return;
    }
  }
}
