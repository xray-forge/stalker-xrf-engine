import { EScheme } from "@/mod/lib/types/configuration";
import { schemes } from "@/mod/scripts/core/db";
import { TAbstractSchemeConstructor } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { AbuseManager } from "@/mod/scripts/core/logic/AbuseManager";
import { ActionButton } from "@/mod/scripts/core/logic/ActionButton";
import { ActionCodepad } from "@/mod/scripts/core/logic/ActionCodepad";
import { ActionCorpseDetect } from "@/mod/scripts/core/logic/ActionCorpseDetect";
import { ActionCover } from "@/mod/scripts/core/logic/ActionCover";
import { ActionCrowSpawner } from "@/mod/scripts/core/logic/ActionCrowSpawner";
import { ActionDanger } from "@/mod/scripts/core/logic/ActionDanger";
import { ActionDeath } from "@/mod/scripts/core/logic/ActionDeath";
import { ActionDeimos } from "@/mod/scripts/core/logic/ActionDeimos";
import { ActionDoor } from "@/mod/scripts/core/logic/ActionDoor";
import { ActionGatherItems } from "@/mod/scripts/core/logic/ActionGatherItems";
import { ActionHit } from "@/mod/scripts/core/logic/ActionHit";
import { ActionIdle } from "@/mod/scripts/core/logic/ActionIdle";
import { ActionLight } from "@/mod/scripts/core/logic/ActionLight";
import { ActionMiniGun } from "@/mod/scripts/core/logic/ActionMiniGun";
import { ActionMonster } from "@/mod/scripts/core/logic/ActionMonster";
import { ActionNoWeapon } from "@/mod/scripts/core/logic/ActionNoWeapon";
import { ActionOnDeath } from "@/mod/scripts/core/logic/ActionOnDeath";
import { ActionOnHit } from "@/mod/scripts/core/logic/ActionOnHit";
import { ActionOscillate } from "@/mod/scripts/core/logic/ActionOscillate";
import { ActionParticle } from "@/mod/scripts/core/logic/ActionParticle";
import { ActionPhysicalIdle } from "@/mod/scripts/core/logic/ActionPhysicalIdle";
import { ActionPostProcess } from "@/mod/scripts/core/logic/ActionPostProcess";
import { ActionProcessHit } from "@/mod/scripts/core/logic/ActionProcessHit";
import { ActionPsyAntenna } from "@/mod/scripts/core/logic/ActionPsyAntenna";
import { ActionSchemeAnimpoint } from "@/mod/scripts/core/logic/ActionSchemeAnimpoint";
import { ActionSchemeCamp } from "@/mod/scripts/core/logic/ActionSchemeCamp";
import { ActionSchemeCamper } from "@/mod/scripts/core/logic/ActionSchemeCamper";
import { ActionSchemeCombat } from "@/mod/scripts/core/logic/ActionSchemeCombat";
import { ActionSchemeCombatIgnore } from "@/mod/scripts/core/logic/ActionSchemeCombatIgnore";
import { ActionSchemeCombatZombied } from "@/mod/scripts/core/logic/ActionSchemeCombatZombied";
import { ActionSchemeCompanion } from "@/mod/scripts/core/logic/ActionSchemeCompanion";
import { ActionSchemeHelpWounded } from "@/mod/scripts/core/logic/ActionSchemeHelpWounded";
import { ActionSchemeMeet } from "@/mod/scripts/core/logic/ActionSchemeMeet";
import { ActionSchemePatrol } from "@/mod/scripts/core/logic/ActionSchemePatrol";
import { ActionSchemeReachTask } from "@/mod/scripts/core/logic/ActionSchemeReachTask";
import { ActionSchemeRemark } from "@/mod/scripts/core/logic/ActionSchemeRemark";
import { ActionSchemeSmartCover } from "@/mod/scripts/core/logic/ActionSchemeSmartCover";
import { ActionSilence } from "@/mod/scripts/core/logic/ActionSilence";
import { ActionSleeper } from "@/mod/scripts/core/logic/ActionSleeper";
import { ActionTeleport } from "@/mod/scripts/core/logic/ActionTeleport";
import { ActionTimer } from "@/mod/scripts/core/logic/ActionTimer";
import { ActionWalker } from "@/mod/scripts/core/logic/ActionWalker";
import { ActionWoundManager } from "@/mod/scripts/core/logic/ActionWoundManager";
import { ActionHeliMove } from "@/mod/scripts/core/logic/heli/ActionHeliMove";
import { ActionMobCombat } from "@/mod/scripts/core/logic/mob/ActionMobCombat";
import { ActionMobDeath } from "@/mod/scripts/core/logic/mob/ActionMobDeath";
import { ActionMobHome } from "@/mod/scripts/core/logic/mob/ActionMobHome";
import { ActionMobJump } from "@/mod/scripts/core/logic/mob/ActionMobJump";
import { ActionMobRemark } from "@/mod/scripts/core/logic/mob/ActionMobRemark";
import { ActionMobWalker } from "@/mod/scripts/core/logic/mob/ActionMobWalker";
import { ActionCutscene } from "@/mod/scripts/cutscenes/ActionCustscene";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("modules");

/**
 * todo;
 */
export function loadSchemeImplementation(
  schemeImplementation: TAbstractSchemeConstructor,
  schemeNameOverride?: EScheme
): void {
  const targetSchemeName: EScheme = schemeNameOverride || schemeImplementation.SCHEME_SECTION;

  logger.info("Loading scheme implementation:", targetSchemeName, schemeImplementation.SCHEME_TYPE);

  if (targetSchemeName === null) {
    abort("Invalid scheme section name provided: '%s'.", schemeImplementation.SCHEME_SECTION);
  } else if (schemeImplementation.SCHEME_TYPE === null) {
    abort("Invalid scheme type provided: '%s'.", schemeImplementation.SCHEME_TYPE);
  }

  schemes.set(schemeNameOverride || schemeImplementation.SCHEME_SECTION, schemeImplementation);
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
    AbuseManager,
    ActionCorpseDetect,
    ActionCover,
    ActionDanger,
    ActionDeath,
    ActionGatherItems,
    ActionProcessHit,
    ActionSchemeAnimpoint,
    ActionSchemeCamp,
    ActionSchemeCamper,
    ActionSchemeCombat,
    ActionSchemeCombatIgnore,
    ActionSchemeCombatZombied,
    ActionSchemeCompanion,
    ActionSchemeHelpWounded,
    ActionSchemePatrol,
    ActionSchemeReachTask,
    ActionSchemeRemark,
    ActionSchemeSmartCover,
    ActionSleeper,
    ActionWalker,
    ActionWoundManager,
  ]);

  loadSchemeImplementation(ActionSchemeMeet, ActionSchemeMeet.SCHEME_SECTION);
  loadSchemeImplementation(ActionSchemeMeet, ActionSchemeMeet.SCHEME_SECTION_ADDITIONAL);

  // Mob schemes.
  loadSchemeImplementations([
    ActionMobCombat,
    ActionMobDeath,
    ActionMobHome,
    ActionMobJump,
    ActionMobRemark,
    ActionMobWalker,
  ]);

  // Item schemes.
  loadSchemeImplementations([
    ActionButton,
    ActionCodepad,
    ActionDoor,
    ActionHeliMove,
    ActionHit,
    ActionMiniGun,
    ActionOnDeath,
    ActionOnHit,
    ActionOscillate,
    ActionPhysicalIdle,
  ]);

  // Restrictor schemes.
  loadSchemeImplementations([
    ActionCrowSpawner,
    ActionCutscene,
    ActionDeimos,
    ActionIdle,
    ActionLight,
    ActionMonster,
    ActionNoWeapon,
    ActionParticle,
    ActionPostProcess,
    ActionPsyAntenna,
    ActionSilence,
    ActionTeleport,
    ActionTimer,
  ]);

  logger.info("Currently declared schemes:", schemes.length());
}
