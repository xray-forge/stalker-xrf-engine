import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { AbuseManager } from "@/mod/scripts/core/logic/AbuseManager";
import { ActionCorpseDetect } from "@/mod/scripts/core/logic/ActionCorpseDetect";
import { ActionDanger } from "@/mod/scripts/core/logic/ActionDanger";
import { ActionDeath } from "@/mod/scripts/core/logic/ActionDeath";
import { ActionGatherItems } from "@/mod/scripts/core/logic/ActionGatherItems";
import { ActionOnHit } from "@/mod/scripts/core/logic/ActionOnHit";
import { ActionProcessHit } from "@/mod/scripts/core/logic/ActionProcessHit";
import { ActionSchemeCombat } from "@/mod/scripts/core/logic/ActionSchemeCombat";
import { ActionSchemeCombatIgnore } from "@/mod/scripts/core/logic/ActionSchemeCombatIgnore";
import { ActionSchemeHelpWounded } from "@/mod/scripts/core/logic/ActionSchemeHelpWounded";
import { ActionSchemeMeet } from "@/mod/scripts/core/logic/ActionSchemeMeet";
import { ActionSchemeReachTask } from "@/mod/scripts/core/logic/ActionSchemeReachTask";
import { ActionWoundManager } from "@/mod/scripts/core/logic/ActionWoundManager";
import { ActionMobCombat } from "@/mod/scripts/core/logic/mob/ActionMobCombat";
import { ActionMobDeath } from "@/mod/scripts/core/logic/mob/ActionMobDeath";
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
      ActionDanger.set_danger(npc, ini, ActionDanger.SCHEME_SECTION, "danger");
      ActionGatherItems.set_gather_items(npc, ini, ActionGatherItems.SCHEME_SECTION, "gather_items");

      const combat_section = getConfigString(ini, section, "on_combat", npc, false, "");

      ActionSchemeCombat.set_combat_checker(npc, ini, EScheme.COMBAT, combat_section);

      reset_invulnerability(npc, ini, section);

      const info_section: Optional<string> = getConfigString(ini, section, "info", npc, false, "");

      if (info_section !== null) {
        setObjectInfo(npc, ini, info_section);
      }

      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

      if (hit_section !== null) {
        ActionProcessHit.set_hit_checker(npc, ini, ActionProcessHit.SCHEME_SECTION, hit_section);
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

      ActionWoundManager.set_wounded(npc, ini, EScheme.WOUNDED, wounded_section);
      AbuseManager.set_abuse(npc, ini, EScheme.ABUSE, section);
      ActionSchemeHelpWounded.set_help_wounded(npc, ini, EScheme.HELP_WOUNDED, null);
      ActionCorpseDetect.set_corpse_detection(npc, ini, EScheme.CORPSE_DETECTION, null);

      const meet_section = getConfigString(ini, section, "meet", npc, false, "");

      ActionSchemeMeet.set_meet(npc, ini, EScheme.MEET, meet_section);

      const death_section = getConfigString(ini, section, "on_death", npc, false, "");

      ActionDeath.set_death(npc, ini, EScheme.DEATH, death_section);
      ActionSchemeCombatIgnore.set_combat_ignore_checker(npc, ini, EScheme.COMBAT_IGNORE);
      ActionSchemeReachTask.set_reach_task(npc, ini, EScheme.REACH_TASK);

      return;
    }

    case ESchemeType.MONSTER: {
      const combat_section: Optional<string> = getConfigString(ini, section, "on_combat", npc, false, "");

      if (combat_section !== null) {
        ActionMobCombat.set_scheme(npc, ini, EScheme.MOB_COMBAT, combat_section);
      }

      const death_section: Optional<string> = getConfigString(ini, section, "on_death", npc, false, "");

      if (death_section !== null) {
        ActionMobDeath.set_scheme(npc, ini, EScheme.MOB_DEATH, death_section);
      }

      reset_invulnerability(npc, ini, section);

      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

      if (hit_section !== null) {
        ActionProcessHit.set_hit_checker(npc, ini, ActionProcessHit.SCHEME_SECTION, hit_section);
      }

      ActionSchemeCombatIgnore.set_combat_ignore_checker(npc, ini, EScheme.COMBAT_IGNORE);

      return;
    }

    case ESchemeType.ITEM: {
      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

      if (hit_section !== null) {
        ActionOnHit.set_scheme(npc, ini, ActionOnHit.SCHEME_SECTION, hit_section);
      }

      return;
    }

    case ESchemeType.HELI: {
      const hit_section: Optional<string> = getConfigString(ini, section, "on_hit", npc, false, "");

      if (hit_section !== null) {
        ActionProcessHit.set_hit_checker(npc, ini, ActionProcessHit.SCHEME_SECTION, hit_section);
      }

      return;
    }
  }
}
