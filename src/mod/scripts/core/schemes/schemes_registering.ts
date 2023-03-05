import { EScheme, ESchemeType } from "@/mod/lib/types/scheme";
import { registry } from "@/mod/scripts/core/database";
import { SchemeAbuse } from "@/mod/scripts/core/schemes/abuse";
import { SchemeAnimpoint } from "@/mod/scripts/core/schemes/animpoint";
import { TAbstractSchemeConstructor } from "@/mod/scripts/core/schemes/base";
import { SchemeCamper } from "@/mod/scripts/core/schemes/camper";
import { SchemeCombat } from "@/mod/scripts/core/schemes/combat";
import { SchemeCombatIgnore } from "@/mod/scripts/core/schemes/combat_ignore";
import { SchemeCombatZombied } from "@/mod/scripts/core/schemes/combat_zombied";
import { SchemeCompanion } from "@/mod/scripts/core/schemes/companion";
import { SchemeCorpseDetection } from "@/mod/scripts/core/schemes/corpse_detection";
import { SchemeCover } from "@/mod/scripts/core/schemes/cover/SchemeCover";
import { SchemeDanger } from "@/mod/scripts/core/schemes/danger/SchemeDanger";
import { SchemeDeath } from "@/mod/scripts/core/schemes/death/SchemeDeath";
import { SchemeGatherItems } from "@/mod/scripts/core/schemes/gather_items/SchemeGatherItems";
import { ActionSchemeHear } from "@/mod/scripts/core/schemes/hear/ActionSchemeHear";
import { SchemeHeliMove } from "@/mod/scripts/core/schemes/heli_move/SchemeHeliMove";
import { SchemeHelpWounded } from "@/mod/scripts/core/schemes/help_wounded/SchemeHelpWounded";
import { SchemeHit } from "@/mod/scripts/core/schemes/hit/SchemeHit";
import { SchemeIdle } from "@/mod/scripts/core/schemes/idle";
import { SchemeMeet } from "@/mod/scripts/core/schemes/meet/SchemeMeet";
import { SchemeMobCombat } from "@/mod/scripts/core/schemes/mob/combat/SchemeMobCombat";
import { SchemeMobDeath } from "@/mod/scripts/core/schemes/mob/death/SchemeMobDeath";
import { SchemeMobHome } from "@/mod/scripts/core/schemes/mob/home/SchemeMobHome";
import { SchemeMobJump } from "@/mod/scripts/core/schemes/mob/jump/SchemeMobJump";
import { SchemeMobRemark } from "@/mod/scripts/core/schemes/mob/remark/SchemeMobRemark";
import { SchemeMobWalker } from "@/mod/scripts/core/schemes/mob/walker/SchemeMobWalker";
import { SchemePatrol } from "@/mod/scripts/core/schemes/patrol/SchemePatrol";
import { SchemePhysicalButton } from "@/mod/scripts/core/schemes/ph_button/SchemePhysicalButton";
import { SchemeCode } from "@/mod/scripts/core/schemes/ph_code/SchemeCode";
import { SchemePhysicalDoor } from "@/mod/scripts/core/schemes/ph_door/SchemePhysicalDoor";
import { SchemePhysicalHit } from "@/mod/scripts/core/schemes/ph_hit/SchemePhysicalHit";
import { SchemePhysicalIdle } from "@/mod/scripts/core/schemes/ph_idle";
import { SchemeMinigun } from "@/mod/scripts/core/schemes/ph_minigun/SchemeMinigun";
import { SchemePhysicalOnDeath } from "@/mod/scripts/core/schemes/ph_on_death/SchemePhysicalOnDeath";
import { SchemePhysicalOnHit } from "@/mod/scripts/core/schemes/ph_on_hit";
import { SchemeOscillate } from "@/mod/scripts/core/schemes/ph_oscillate";
import { SchemeReachTask } from "@/mod/scripts/core/schemes/reach_task";
import { SchemeRemark } from "@/mod/scripts/core/schemes/remark";
import { SchemeSleeper } from "@/mod/scripts/core/schemes/sleeper";
import { SchemeSmartCover } from "@/mod/scripts/core/schemes/smartcover";
import { SchemeCrowSpawner } from "@/mod/scripts/core/schemes/sr_crow_spawner";
import { SchemeCutscene } from "@/mod/scripts/core/schemes/sr_cutscene";
import { SchemeDeimos } from "@/mod/scripts/core/schemes/sr_deimos";
import { SchemeLight } from "@/mod/scripts/core/schemes/sr_light";
import { SchemeMonster } from "@/mod/scripts/core/schemes/sr_monster";
import { SchemeNoWeapon } from "@/mod/scripts/core/schemes/sr_no_weapon";
import { SchemeParticle } from "@/mod/scripts/core/schemes/sr_particle";
import { SchemePostProcess } from "@/mod/scripts/core/schemes/sr_postprocess";
import { SchemePsyAntenna } from "@/mod/scripts/core/schemes/sr_psy_antenna";
import { SchemeSilence } from "@/mod/scripts/core/schemes/sr_silence";
import { SchemeTeleport } from "@/mod/scripts/core/schemes/teleport";
import { SchemeTimer } from "@/mod/scripts/core/schemes/timer";
import { SchemeWalker } from "@/mod/scripts/core/schemes/walker";
import { SchemeWounded } from "@/mod/scripts/core/schemes/wounded";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("schemes_registering");

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
    SchemeHeliMove,
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
