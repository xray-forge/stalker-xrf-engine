import { ActionButton } from "@/mod/scripts/core/logic/ActionButton";
import { ActionCodepad } from "@/mod/scripts/core/logic/ActionCodepad";
import { ActionHit } from "@/mod/scripts/core/logic/ActionHit";
import { ActionIdle } from "@/mod/scripts/core/logic/ActionIdle";
import { ActionOnDeath } from "@/mod/scripts/core/logic/ActionOnDeath";
import { ActionOnHit } from "@/mod/scripts/core/logic/ActionOnHit";
import { ActionProcessHit } from "@/mod/scripts/core/logic/ActionProcessHit";
import { ActionHeliMove } from "@/mod/scripts/core/logic/heli/ActionHeliMove";
import { ActionMobCombat } from "@/mod/scripts/core/logic/mob/ActionMobCombat";
import { ActionMobDeath } from "@/mod/scripts/core/logic/mob/ActionMobDeath";
import { ActionMobHome } from "@/mod/scripts/core/logic/mob/ActionMobHome";
import { ActionMobJump } from "@/mod/scripts/core/logic/mob/ActionMobJump";
import { ActionMobRemark } from "@/mod/scripts/core/logic/mob/ActionMobRemark";
import { ActionMobWalker } from "@/mod/scripts/core/logic/mob/ActionMobWalker";
import {
  loadScheme,
  stype_heli,
  stype_item,
  stype_mobile,
  stype_restrictor,
  stype_stalker
} from "@/mod/scripts/core/schemes";
import { ActionCutscene } from "@/mod/scripts/cutscenes/ActionCustscene";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("modules");

export function initializeModules(): void {
  log.info("Initialize modules");

  loadScheme("xr_danger", "danger", stype_stalker);
  loadScheme("xr_gather_items", "gather_items", stype_stalker);
  loadScheme("xr_abuse", "abuse", stype_stalker);
  loadScheme("xr_walker", "walker", stype_stalker);
  loadScheme("xr_remark", "remark", stype_stalker);
  loadScheme("xr_cover", "cover", stype_stalker);
  loadScheme("xr_sleeper", "sleeper", stype_stalker);
  loadScheme("xr_kamp", "kamp", stype_stalker);
  loadScheme("xr_camper", "camper", stype_stalker);
  loadScheme("xr_meet", "meet", stype_stalker);
  loadScheme("xr_help_wounded", "help_wounded", stype_stalker);
  loadScheme("xr_corpse_detection", "corpse_detection", stype_stalker);
  loadScheme("xr_combat", "combat", stype_stalker);
  loadScheme("xr_death", "death", stype_stalker);
  loadScheme(ActionProcessHit, ActionProcessHit.SCHEME_SECTION, stype_stalker);
  loadScheme("xr_wounded", "wounded", stype_stalker);
  loadScheme("xr_meet", "actor_dialogs", stype_stalker);
  loadScheme("xr_combat_ignore", "combat_ignore", stype_stalker);
  loadScheme("xr_combat_zombied", "combat_zombied", stype_stalker);
  loadScheme("xr_patrol", "patrol", stype_stalker);
  loadScheme("xr_smartcover", "smartcover", stype_stalker);
  loadScheme("xr_companion", "companion", stype_stalker);
  loadScheme("xr_animpoint", "animpoint", stype_stalker);
  loadScheme("xr_reach_task", "reach_task", stype_stalker);

  loadScheme(ActionMobRemark, ActionMobRemark.SCHEME_SECTION, stype_mobile);
  loadScheme(ActionMobWalker, ActionMobWalker.SCHEME_SECTION, stype_mobile);
  loadScheme(ActionMobCombat, ActionMobCombat.SCHEME_SECTION, stype_mobile);
  loadScheme(ActionMobDeath, ActionMobDeath.SCHEME_SECTION, stype_mobile);
  loadScheme(ActionMobJump, ActionMobJump.SCHEME_SECTION, stype_mobile);
  loadScheme(ActionMobHome, ActionMobHome.SCHEME_SECTION, stype_mobile);

  loadScheme("ph_door", "ph_door", stype_item);
  loadScheme(ActionIdle, ActionIdle.SCHEME_SECTION, stype_item);
  loadScheme(ActionHit, ActionHit.SCHEME_SECTION, stype_item);
  loadScheme(ActionOnHit, ActionOnHit.SCHEME_SECTION, stype_item);
  loadScheme(ActionButton, ActionButton.SCHEME_SECTION, stype_item);
  loadScheme(ActionCodepad, ActionCodepad.SCHEME_SECTION, stype_item);
  loadScheme(ActionOnDeath, ActionOnDeath.SCHEME_SECTION, stype_item);
  loadScheme("ph_minigun", "ph_minigun", stype_item);
  // --loadScheme("ph_target",						"ph_target",		stype_item)
  loadScheme("ph_oscillate", "ph_oscillate", stype_item);

  loadScheme(ActionHeliMove, "heli_move", stype_heli);

  loadScheme("sr_no_weapon", "sr_no_weapon", stype_restrictor);
  loadScheme("sr_teleport", "sr_teleport", stype_restrictor);
  loadScheme("sr_idle", "sr_idle", stype_restrictor);
  loadScheme("sr_light", "sr_light", stype_restrictor);
  loadScheme("sr_timer", "sr_timer", stype_restrictor);
  loadScheme("sr_psy_antenna", "sr_psy_antenna", stype_restrictor);
  loadScheme("sr_postprocess", "sr_postprocess", stype_restrictor);
  loadScheme("sr_particle", "sr_particle", stype_restrictor);
  loadScheme(ActionCutscene, ActionCutscene.SCHEME_SECTION, stype_restrictor);
  // --loadScheme("sr_bloodsucker",					"sr_bloodsucker",	stype_restrictor)
  loadScheme("sr_monster", "sr_monster", stype_restrictor);
  // --loadScheme("sr_robbery",						"sr_robbery",		stype_restrictor)
  // --loadScheme("sr_survival",						"sr_survival",		stype_restrictor)
  loadScheme("sr_crow_spawner", "sr_crow_spawner", stype_restrictor);
  // --loadScheme("sr_shooting",						"sr_shooting",		stype_restrictor)
  // --loadScheme("sr_recoveritem",					"sr_recoveritem",	stype_restrictor)
  loadScheme("sr_silence", "sr_silence", stype_restrictor);
  loadScheme("sr_deimos", "sr_deimos", stype_restrictor);
}
