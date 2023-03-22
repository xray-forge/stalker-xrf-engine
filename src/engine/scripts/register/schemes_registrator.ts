import { registry } from "@/engine/core/database";
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
import { ActionSchemeHear } from "@/engine/core/schemes/hear/ActionSchemeHear";
import { SchemeHelicopterMove } from "@/engine/core/schemes/heli_move";
import { SchemeHelpWounded } from "@/engine/core/schemes/help_wounded";
import { SchemeHit } from "@/engine/core/schemes/hit";
import { SchemeMeet } from "@/engine/core/schemes/meet";
import { SchemeMobCombat } from "@/engine/core/schemes/mob/combat";
import { SchemeMobDeath } from "@/engine/core/schemes/mob/death";
import { SchemeMobHome } from "@/engine/core/schemes/mob/home";
import { SchemeMobJump } from "@/engine/core/schemes/mob/jump";
import { SchemeMobRemark } from "@/engine/core/schemes/mob/remark";
import { SchemeMobWalker } from "@/engine/core/schemes/mob/walker";
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
import { SchemeTeleport } from "@/engine/core/schemes/teleport";
import { SchemeTimer } from "@/engine/core/schemes/timer";
import { SchemeWalker } from "@/engine/core/schemes/walker";
import { SchemeWounded } from "@/engine/core/schemes/wounded";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function loadSchemeImplementation(
  schemeImplementation: TAbstractSchemeConstructor,
  schemeNameOverride?: EScheme
): void {
  const targetSchemeName: EScheme = schemeNameOverride || schemeImplementation.SCHEME_SECTION;

  logger.info("Loading scheme implementation:", targetSchemeName, ESchemeType[schemeImplementation.SCHEME_TYPE]);

  if (targetSchemeName === null) {
    abort("Invalid scheme section name provided: '%s'.", schemeImplementation.SCHEME_SECTION);
  } else if (schemeImplementation.SCHEME_TYPE === null) {
    abort("Invalid scheme type provided: '%s'.", schemeImplementation.SCHEME_TYPE);
  }

  registry.schemes.set(schemeNameOverride || schemeImplementation.SCHEME_SECTION, schemeImplementation);
}

/**
 * todo;
 */
export function loadSchemeImplementations(schemeImplementations: Array<TAbstractSchemeConstructor>): void {
  schemeImplementations.forEach((it) => loadSchemeImplementation(it));
}

/**
 * todo;
 */
export function registerSchemeModules(): void {
  logger.info("Register scheme modules");

  loadSchemeImplementations([
    ActionSchemeHear,
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
  ]);

  loadSchemeImplementation(SchemeMeet, SchemeMeet.SCHEME_SECTION_ACTOR_DIALOGS);
}
