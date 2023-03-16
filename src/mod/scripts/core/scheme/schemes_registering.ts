import { EScheme, ESchemeType } from "@/mod/lib/types/scheme";
import { registry } from "@/mod/scripts/core/database";
import { SchemeAbuse } from "@/mod/scripts/core/scheme/abuse";
import { SchemeAnimpoint } from "@/mod/scripts/core/scheme/animpoint";
import { TAbstractSchemeConstructor } from "@/mod/scripts/core/scheme/base";
import { SchemeCamper } from "@/mod/scripts/core/scheme/camper";
import { SchemeCombat } from "@/mod/scripts/core/scheme/combat";
import { SchemeCombatIgnore } from "@/mod/scripts/core/scheme/combat_ignore";
import { SchemeCombatZombied } from "@/mod/scripts/core/scheme/combat_zombied";
import { SchemeCompanion } from "@/mod/scripts/core/scheme/companion";
import { SchemeCorpseDetection } from "@/mod/scripts/core/scheme/corpse_detection";
import { SchemeCover } from "@/mod/scripts/core/scheme/cover";
import { SchemeDanger } from "@/mod/scripts/core/scheme/danger";
import { SchemeDeath } from "@/mod/scripts/core/scheme/death";
import { SchemeGatherItems } from "@/mod/scripts/core/scheme/gather_items";
import { ActionSchemeHear } from "@/mod/scripts/core/scheme/hear/ActionSchemeHear";
import { SchemeHelicopterMove } from "@/mod/scripts/core/scheme/heli_move";
import { SchemeHelpWounded } from "@/mod/scripts/core/scheme/help_wounded";
import { SchemeHit } from "@/mod/scripts/core/scheme/hit";
import { SchemeIdle } from "@/mod/scripts/core/scheme/idle";
import { SchemeMeet } from "@/mod/scripts/core/scheme/meet";
import { SchemeMobCombat } from "@/mod/scripts/core/scheme/mob/combat";
import { SchemeMobDeath } from "@/mod/scripts/core/scheme/mob/death";
import { SchemeMobHome } from "@/mod/scripts/core/scheme/mob/home";
import { SchemeMobJump } from "@/mod/scripts/core/scheme/mob/jump";
import { SchemeMobRemark } from "@/mod/scripts/core/scheme/mob/remark";
import { SchemeMobWalker } from "@/mod/scripts/core/scheme/mob/walker";
import { SchemePatrol } from "@/mod/scripts/core/scheme/patrol/SchemePatrol";
import { SchemePhysicalButton } from "@/mod/scripts/core/scheme/ph_button";
import { SchemeCode } from "@/mod/scripts/core/scheme/ph_code";
import { SchemePhysicalDoor } from "@/mod/scripts/core/scheme/ph_door";
import { SchemePhysicalHit } from "@/mod/scripts/core/scheme/ph_hit";
import { SchemePhysicalIdle } from "@/mod/scripts/core/scheme/ph_idle";
import { SchemeMinigun } from "@/mod/scripts/core/scheme/ph_minigun";
import { SchemePhysicalOnDeath } from "@/mod/scripts/core/scheme/ph_on_death";
import { SchemePhysicalOnHit } from "@/mod/scripts/core/scheme/ph_on_hit";
import { SchemeOscillate } from "@/mod/scripts/core/scheme/ph_oscillate";
import { SchemeReachTask } from "@/mod/scripts/core/scheme/reach_task";
import { SchemeRemark } from "@/mod/scripts/core/scheme/remark";
import { SchemeSleeper } from "@/mod/scripts/core/scheme/sleeper";
import { SchemeSmartCover } from "@/mod/scripts/core/scheme/smartcover";
import { SchemeCrowSpawner } from "@/mod/scripts/core/scheme/sr_crow_spawner";
import { SchemeCutscene } from "@/mod/scripts/core/scheme/sr_cutscene";
import { SchemeDeimos } from "@/mod/scripts/core/scheme/sr_deimos";
import { SchemeLight } from "@/mod/scripts/core/scheme/sr_light";
import { SchemeMonster } from "@/mod/scripts/core/scheme/sr_monster";
import { SchemeNoWeapon } from "@/mod/scripts/core/scheme/sr_no_weapon";
import { SchemeParticle } from "@/mod/scripts/core/scheme/sr_particle";
import { SchemePostProcess } from "@/mod/scripts/core/scheme/sr_postprocess";
import { SchemePsyAntenna } from "@/mod/scripts/core/scheme/sr_psy_antenna";
import { SchemeSilence } from "@/mod/scripts/core/scheme/sr_silence";
import { SchemeTeleport } from "@/mod/scripts/core/scheme/teleport";
import { SchemeTimer } from "@/mod/scripts/core/scheme/timer";
import { SchemeWalker } from "@/mod/scripts/core/scheme/walker";
import { SchemeWounded } from "@/mod/scripts/core/scheme/wounded";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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
