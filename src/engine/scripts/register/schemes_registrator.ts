import { SchemeAbuse } from "@/engine/core/schemes/abuse";
import { SchemeAnimpoint } from "@/engine/core/schemes/animpoint";
import { TAbstractSchemeConstructor } from "@/engine/core/schemes/base";
import { SchemeCamper } from "@/engine/core/schemes/camper";
import { SchemeCombat } from "@/engine/core/schemes/combat";
import { SchemeCombatCamper } from "@/engine/core/schemes/combat_camper";
import { SchemeCombatIgnore } from "@/engine/core/schemes/combat_ignore";
import { SchemeCombatZombied } from "@/engine/core/schemes/combat_zombied";
import { SchemeCompanion } from "@/engine/core/schemes/companion";
import { SchemeCorpseDetection } from "@/engine/core/schemes/corpse_detection";
import { SchemeCover } from "@/engine/core/schemes/cover";
import { SchemeDanger } from "@/engine/core/schemes/danger";
import { SchemeDeath } from "@/engine/core/schemes/death";
import { SchemeGatherItems } from "@/engine/core/schemes/gather_items";
import { SchemeHear } from "@/engine/core/schemes/hear/SchemeHear";
import { SchemeHelicopterMove } from "@/engine/core/schemes/heli_move";
import { SchemeHelpWounded } from "@/engine/core/schemes/help_wounded";
import { SchemeHit } from "@/engine/core/schemes/hit";
import { SchemeMeet } from "@/engine/core/schemes/meet";
import { SchemeMobCombat } from "@/engine/core/schemes/mob_combat";
import { SchemeMobDeath } from "@/engine/core/schemes/mob_death";
import { SchemeMobHome } from "@/engine/core/schemes/mob_home";
import { SchemeMobJump } from "@/engine/core/schemes/mob_jump";
import { SchemeMobRemark } from "@/engine/core/schemes/mob_remark";
import { SchemeMobWalker } from "@/engine/core/schemes/mob_walker";
import { SchemePatrol } from "@/engine/core/schemes/patrol/SchemePatrol";
import { SchemePhysicalButton } from "@/engine/core/schemes/ph_button";
import { SchemeCode } from "@/engine/core/schemes/ph_code";
import { SchemePhysicalDoor } from "@/engine/core/schemes/ph_door";
import { SchemePhysicalForce } from "@/engine/core/schemes/ph_force";
import { SchemePhysicalHit } from "@/engine/core/schemes/ph_hit";
import { SchemePhysicalIdle } from "@/engine/core/schemes/ph_idle";
import { SchemeMinigun } from "@/engine/core/schemes/ph_minigun";
import { SchemePhysicalOnDeath } from "@/engine/core/schemes/ph_on_death";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/ph_on_hit";
import { SchemeOscillate } from "@/engine/core/schemes/ph_oscillate";
import { SchemeReachTask } from "@/engine/core/schemes/reach_task";
import { SchemeRemark } from "@/engine/core/schemes/remark";
import { SchemeSleeper } from "@/engine/core/schemes/sleeper";
import { SchemeSmartCover } from "@/engine/core/schemes/smartcover";
import { SchemeCrowSpawner } from "@/engine/core/schemes/sr_crow_spawner";
import { SchemeCutscene } from "@/engine/core/schemes/sr_cutscene";
import { SchemeDeimos } from "@/engine/core/schemes/sr_deimos";
import { SchemeIdle } from "@/engine/core/schemes/sr_idle";
import { SchemeLight } from "@/engine/core/schemes/sr_light";
import { SchemeMonster } from "@/engine/core/schemes/sr_monster";
import { SchemeNoWeapon } from "@/engine/core/schemes/sr_no_weapon";
import { SchemeParticle } from "@/engine/core/schemes/sr_particle";
import { SchemePostProcess } from "@/engine/core/schemes/sr_postprocess";
import { SchemePsyAntenna } from "@/engine/core/schemes/sr_psy_antenna";
import { SchemeSilence } from "@/engine/core/schemes/sr_silence";
import { SchemeTeleport } from "@/engine/core/schemes/sr_teleport";
import { SchemeTimer } from "@/engine/core/schemes/sr_timer";
import { SchemeWalker } from "@/engine/core/schemes/walker";
import { SchemeWounded } from "@/engine/core/schemes/wounded";
import { LuaLogger } from "@/engine/core/utils/logging";
import { loadSchemeImplementation, loadSchemeImplementations } from "@/engine/core/utils/scheme/scheme_setup";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register logics handling schemes.
 */
export function registerSchemes(): void {
  logger.info("Register scheme modules");

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

  loadSchemeImplementation(SchemeMeet, SchemeMeet.SCHEME_SECTION_ACTOR_DIALOGS);
}
