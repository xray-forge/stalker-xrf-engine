import { TAbstractSchemeConstructor } from "@/engine/core/ai/scheme";
import { SchemeHelicopterMove } from "@/engine/core/schemes/helicopter/heli_move";
import { SchemeMobCombat } from "@/engine/core/schemes/monster/mob_combat";
import { SchemeMobDeath } from "@/engine/core/schemes/monster/mob_death";
import { SchemeMobHome } from "@/engine/core/schemes/monster/mob_home";
import { SchemeMobJump } from "@/engine/core/schemes/monster/mob_jump";
import { SchemeMobRemark } from "@/engine/core/schemes/monster/mob_remark";
import { SchemeMobWalker } from "@/engine/core/schemes/monster/mob_walker";
import { SchemePhysicalButton } from "@/engine/core/schemes/physical/ph_button";
import { SchemeCode } from "@/engine/core/schemes/physical/ph_code";
import { SchemePhysicalDoor } from "@/engine/core/schemes/physical/ph_door";
import { SchemePhysicalForce } from "@/engine/core/schemes/physical/ph_force";
import { SchemePhysicalHit } from "@/engine/core/schemes/physical/ph_hit";
import { SchemePhysicalIdle } from "@/engine/core/schemes/physical/ph_idle";
import { SchemeMinigun } from "@/engine/core/schemes/physical/ph_minigun";
import { SchemePhysicalOnDeath } from "@/engine/core/schemes/physical/ph_on_death";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/physical/ph_on_hit";
import { SchemeOscillate } from "@/engine/core/schemes/physical/ph_oscillate";
import { SchemeCrowSpawner } from "@/engine/core/schemes/restrictor/sr_crow_spawner";
import { SchemeCutscene } from "@/engine/core/schemes/restrictor/sr_cutscene";
import { SchemeDeimos } from "@/engine/core/schemes/restrictor/sr_deimos";
import { SchemeIdle } from "@/engine/core/schemes/restrictor/sr_idle";
import { SchemeLight } from "@/engine/core/schemes/restrictor/sr_light";
import { SchemeMonster } from "@/engine/core/schemes/restrictor/sr_monster";
import { SchemeNoWeapon } from "@/engine/core/schemes/restrictor/sr_no_weapon";
import { SchemeParticle } from "@/engine/core/schemes/restrictor/sr_particle";
import { SchemePostProcess } from "@/engine/core/schemes/restrictor/sr_postprocess";
import { SchemePsyAntenna } from "@/engine/core/schemes/restrictor/sr_psy_antenna";
import { SchemeSilence } from "@/engine/core/schemes/restrictor/sr_silence";
import { SchemeTeleport } from "@/engine/core/schemes/restrictor/sr_teleport";
import { SchemeTimer } from "@/engine/core/schemes/restrictor/sr_timer";
import { SchemeHear } from "@/engine/core/schemes/shared/hear/SchemeHear";
import { SchemeAbuse } from "@/engine/core/schemes/stalker/abuse";
import { SchemeAnimpoint } from "@/engine/core/schemes/stalker/animpoint";
import { SchemeCamper } from "@/engine/core/schemes/stalker/camper";
import { SchemeCombat } from "@/engine/core/schemes/stalker/combat";
import { SchemeCombatCamper } from "@/engine/core/schemes/stalker/combat_camper";
import { SchemePostCombatIdle } from "@/engine/core/schemes/stalker/combat_idle";
import { SchemeCombatIgnore } from "@/engine/core/schemes/stalker/combat_ignore";
import { SchemeCombatZombied } from "@/engine/core/schemes/stalker/combat_zombied";
import { SchemeCompanion } from "@/engine/core/schemes/stalker/companion";
import { SchemeCorpseDetection } from "@/engine/core/schemes/stalker/corpse_detection";
import { SchemeCover } from "@/engine/core/schemes/stalker/cover";
import { SchemeDanger } from "@/engine/core/schemes/stalker/danger";
import { SchemeDeath } from "@/engine/core/schemes/stalker/death";
import { SchemeGatherItems } from "@/engine/core/schemes/stalker/gather_items";
import { SchemeHelpWounded } from "@/engine/core/schemes/stalker/help_wounded";
import { SchemeHit } from "@/engine/core/schemes/stalker/hit";
import { SchemeMeet } from "@/engine/core/schemes/stalker/meet";
import { SchemePatrol } from "@/engine/core/schemes/stalker/patrol/SchemePatrol";
import { SchemeReachTask } from "@/engine/core/schemes/stalker/reach_task";
import { SchemeRemark } from "@/engine/core/schemes/stalker/remark";
import { SchemeSleeper } from "@/engine/core/schemes/stalker/sleeper";
import { SchemeSmartCover } from "@/engine/core/schemes/stalker/smartcover";
import { SchemeWalker } from "@/engine/core/schemes/stalker/walker";
import { SchemeWounded } from "@/engine/core/schemes/stalker/wounded";
import { LuaLogger } from "@/engine/core/utils/logging";
import { loadSchemeImplementations } from "@/engine/core/utils/scheme/scheme_setup";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register logics handling schemes.
 */
export function registerSchemes(): void {
  logger.format("Register scheme modules");

  loadSchemeImplementations(
    $fromArray([
      SchemeHear,
      SchemeAbuse,
      SchemeAnimpoint,
      SchemeCamper,
      SchemeCode,
      SchemeCombat,
      SchemeCombatIgnore,
      SchemeCombatZombied,
      SchemeCombatCamper,
      SchemeCompanion,
      SchemeCorpseDetection,
      SchemeCover,
      SchemeCrowSpawner,
      SchemeCutscene,
      SchemeDanger,
      SchemeDeath,
      SchemeDeimos,
      SchemeGatherItems,
      SchemeHelicopterMove,
      SchemeHelpWounded,
      SchemeHit,
      SchemeIdle,
      SchemeLight,
      SchemeMeet,
      SchemeMinigun,
      SchemeMobCombat,
      SchemeMobDeath,
      SchemeMobHome,
      SchemeMobJump,
      SchemeMobRemark,
      SchemeMobWalker,
      SchemeMonster,
      SchemeNoWeapon,
      SchemeOscillate,
      SchemeParticle,
      SchemePatrol,
      SchemePhysicalButton,
      SchemePhysicalDoor,
      SchemePhysicalForce,
      SchemePhysicalHit,
      SchemePhysicalIdle,
      SchemePhysicalOnDeath,
      SchemePhysicalOnHit,
      SchemePostCombatIdle,
      SchemePostProcess,
      SchemePsyAntenna,
      SchemeReachTask,
      SchemeRemark,
      SchemeSilence,
      SchemeSleeper,
      SchemeSmartCover,
      SchemeTeleport,
      SchemeTimer,
      SchemeWalker,
      SchemeWounded,
    ] as Array<TAbstractSchemeConstructor>)
  );
}
