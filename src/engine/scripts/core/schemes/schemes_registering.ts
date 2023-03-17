import { EScheme, ESchemeType } from "@/engine/lib/types/scheme";
import { registry } from "@/engine/scripts/core/database";
import { SchemeAbuse } from "@/engine/scripts/core/schemes/abuse";
import { SchemeAnimpoint } from "@/engine/scripts/core/schemes/animpoint";
import { TAbstractSchemeConstructor } from "@/engine/scripts/core/schemes/base";
import { SchemeCamper } from "@/engine/scripts/core/schemes/camper";
import { SchemeCombat } from "@/engine/scripts/core/schemes/combat";
import { SchemeCombatIgnore } from "@/engine/scripts/core/schemes/combat_ignore";
import { SchemeCombatZombied } from "@/engine/scripts/core/schemes/combat_zombied";
import { SchemeCompanion } from "@/engine/scripts/core/schemes/companion";
import { SchemeCorpseDetection } from "@/engine/scripts/core/schemes/corpse_detection";
import { SchemeCover } from "@/engine/scripts/core/schemes/cover";
import { SchemeDanger } from "@/engine/scripts/core/schemes/danger";
import { SchemeDeath } from "@/engine/scripts/core/schemes/death";
import { SchemeGatherItems } from "@/engine/scripts/core/schemes/gather_items";
import { ActionSchemeHear } from "@/engine/scripts/core/schemes/hear/ActionSchemeHear";
import { SchemeHelicopterMove } from "@/engine/scripts/core/schemes/heli_move";
import { SchemeHelpWounded } from "@/engine/scripts/core/schemes/help_wounded";
import { SchemeHit } from "@/engine/scripts/core/schemes/hit";
import { SchemeIdle } from "@/engine/scripts/core/schemes/idle";
import { SchemeMeet } from "@/engine/scripts/core/schemes/meet";
import { SchemeMobCombat } from "@/engine/scripts/core/schemes/mob/combat";
import { SchemeMobDeath } from "@/engine/scripts/core/schemes/mob/death";
import { SchemeMobHome } from "@/engine/scripts/core/schemes/mob/home";
import { SchemeMobJump } from "@/engine/scripts/core/schemes/mob/jump";
import { SchemeMobRemark } from "@/engine/scripts/core/schemes/mob/remark";
import { SchemeMobWalker } from "@/engine/scripts/core/schemes/mob/walker";
import { SchemePatrol } from "@/engine/scripts/core/schemes/patrol/SchemePatrol";
import { SchemePhysicalButton } from "@/engine/scripts/core/schemes/ph_button";
import { SchemeCode } from "@/engine/scripts/core/schemes/ph_code";
import { SchemePhysicalDoor } from "@/engine/scripts/core/schemes/ph_door";
import { SchemePhysicalHit } from "@/engine/scripts/core/schemes/ph_hit";
import { SchemePhysicalIdle } from "@/engine/scripts/core/schemes/ph_idle";
import { SchemeMinigun } from "@/engine/scripts/core/schemes/ph_minigun";
import { SchemePhysicalOnDeath } from "@/engine/scripts/core/schemes/ph_on_death";
import { SchemePhysicalOnHit } from "@/engine/scripts/core/schemes/ph_on_hit";
import { SchemeOscillate } from "@/engine/scripts/core/schemes/ph_oscillate";
import { SchemeReachTask } from "@/engine/scripts/core/schemes/reach_task";
import { SchemeRemark } from "@/engine/scripts/core/schemes/remark";
import { SchemeSleeper } from "@/engine/scripts/core/schemes/sleeper";
import { SchemeSmartCover } from "@/engine/scripts/core/schemes/smartcover";
import { SchemeCrowSpawner } from "@/engine/scripts/core/schemes/sr_crow_spawner";
import { SchemeCutscene } from "@/engine/scripts/core/schemes/sr_cutscene";
import { SchemeDeimos } from "@/engine/scripts/core/schemes/sr_deimos";
import { SchemeLight } from "@/engine/scripts/core/schemes/sr_light";
import { SchemeMonster } from "@/engine/scripts/core/schemes/sr_monster";
import { SchemeNoWeapon } from "@/engine/scripts/core/schemes/sr_no_weapon";
import { SchemeParticle } from "@/engine/scripts/core/schemes/sr_particle";
import { SchemePostProcess } from "@/engine/scripts/core/schemes/sr_postprocess";
import { SchemePsyAntenna } from "@/engine/scripts/core/schemes/sr_psy_antenna";
import { SchemeSilence } from "@/engine/scripts/core/schemes/sr_silence";
import { SchemeTeleport } from "@/engine/scripts/core/schemes/teleport";
import { SchemeTimer } from "@/engine/scripts/core/schemes/timer";
import { SchemeWalker } from "@/engine/scripts/core/schemes/walker";
import { SchemeWounded } from "@/engine/scripts/core/schemes/wounded";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";

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

export function initializeModules(): void {
  logger.info("Initialize modules");

  // Stalkers schemes.
  loadSchemeImplementations([
    SchemeAbuse,
    SchemeCorpseDetection,
    SchemeCover,
    SchemeDanger,
    SchemeDeath,
    SchemeGatherItems,
    SchemeHit,
    SchemeAnimpoint,
    SchemeCamper,
    SchemeCombat,
    SchemeCombatIgnore,
    SchemeCombatZombied,
    SchemeCompanion,
    ActionSchemeHear,
    SchemeHelpWounded,
    SchemePatrol,
    SchemeReachTask,
    SchemeRemark,
    SchemeSmartCover,
    SchemeSleeper,
    SchemeWalker,
    SchemeWounded,
  ]);

  loadSchemeImplementation(SchemeMeet, SchemeMeet.SCHEME_SECTION);
  loadSchemeImplementation(SchemeMeet, SchemeMeet.SCHEME_SECTION_ADDITIONAL);

  // Mob schemes.
  loadSchemeImplementations([
    SchemeMobCombat,
    SchemeMobDeath,
    SchemeMobHome,
    SchemeMobJump,
    SchemeMobRemark,
    SchemeMobWalker,
  ]);

  // Item schemes.
  loadSchemeImplementations([
    SchemePhysicalButton,
    SchemeCode,
    SchemePhysicalDoor,
    SchemeHelicopterMove,
    SchemePhysicalHit,
    SchemeMinigun,
    SchemePhysicalOnDeath,
    SchemePhysicalOnHit,
    SchemeOscillate,
    SchemePhysicalIdle,
  ]);

  // Restrictor schemes.
  loadSchemeImplementations([
    SchemeCrowSpawner,
    SchemeCutscene,
    SchemeDeimos,
    SchemeIdle,
    SchemeLight,
    SchemeMonster,
    SchemeNoWeapon,
    SchemeParticle,
    SchemePostProcess,
    SchemePsyAntenna,
    SchemeSilence,
    SchemeTeleport,
    SchemeTimer,
  ]);
}
