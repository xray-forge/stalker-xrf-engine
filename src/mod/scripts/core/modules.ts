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
import { ESchemeType, loadScheme } from "@/mod/scripts/core/schemes";
import { ActionCutscene } from "@/mod/scripts/cutscenes/ActionCustscene";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("modules");

export function initializeModules(): void {
  logger.info("Initialize modules");

  loadScheme(AbuseManager, AbuseManager.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionCorpseDetect, ActionCorpseDetect.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionCover, ActionCover.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionDanger, ActionDanger.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionDeath, ActionDeath.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionGatherItems, ActionGatherItems.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionProcessHit, ActionProcessHit.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeAnimpoint, ActionSchemeAnimpoint.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeCamp, ActionSchemeCamp.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeCamper, ActionSchemeCamper.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeCombat, ActionSchemeCombat.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeCombatIgnore, ActionSchemeCombatIgnore.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeCombatZombied, ActionSchemeCombatZombied.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeCompanion, ActionSchemeCompanion.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeHelpWounded, ActionSchemeHelpWounded.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeMeet, ActionSchemeMeet.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeMeet, ActionSchemeMeet.SCHEME_SECTION_ADDITIONAL, ESchemeType.STALKER);
  loadScheme(ActionSchemePatrol, ActionSchemePatrol.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeReachTask, ActionSchemeReachTask.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeRemark, ActionSchemeRemark.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSchemeSmartCover, ActionSchemeSmartCover.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionSleeper, ActionSleeper.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionWalker, ActionWalker.SCHEME_SECTION, ESchemeType.STALKER);
  loadScheme(ActionWoundManager, ActionWoundManager.SCHEME_SECTION, ESchemeType.STALKER);

  loadScheme(ActionMobCombat, ActionMobCombat.SCHEME_SECTION, ESchemeType.MOBILE);
  loadScheme(ActionMobDeath, ActionMobDeath.SCHEME_SECTION, ESchemeType.MOBILE);
  loadScheme(ActionMobHome, ActionMobHome.SCHEME_SECTION, ESchemeType.MOBILE);
  loadScheme(ActionMobJump, ActionMobJump.SCHEME_SECTION, ESchemeType.MOBILE);
  loadScheme(ActionMobRemark, ActionMobRemark.SCHEME_SECTION, ESchemeType.MOBILE);
  loadScheme(ActionMobWalker, ActionMobWalker.SCHEME_SECTION, ESchemeType.MOBILE);

  // -- loadScheme("ph_target", "ph_target", ESchemeType.ITEM);
  loadScheme(ActionButton, ActionButton.SCHEME_SECTION, ESchemeType.ITEM);
  loadScheme(ActionCodepad, ActionCodepad.SCHEME_SECTION, ESchemeType.ITEM);
  loadScheme(ActionDoor, ActionDoor.SCHEME_SECTION, ESchemeType.ITEM);
  loadScheme(ActionHeliMove, ActionHeliMove.SCHEME_SECTION, ESchemeType.HELI);
  loadScheme(ActionHit, ActionHit.SCHEME_SECTION, ESchemeType.ITEM);
  loadScheme(ActionMiniGun, ActionMiniGun.SCHEME_SECTION, ESchemeType.ITEM);
  loadScheme(ActionOnDeath, ActionOnDeath.SCHEME_SECTION, ESchemeType.ITEM);
  loadScheme(ActionOnHit, ActionOnHit.SCHEME_SECTION, ESchemeType.ITEM);
  loadScheme(ActionOscillate, ActionOscillate.SCHEME_SECTION, ESchemeType.ITEM);
  loadScheme(ActionPhysicalIdle, ActionPhysicalIdle.SCHEME_SECTION, ESchemeType.ITEM);

  // --loadScheme("sr_bloodsucker", "sr_bloodsucker", ESchemeType.RESTRICTOR)
  // --loadScheme("sr_recoveritem", "sr_recoveritem", ESchemeType.RESTRICTOR)
  // --loadScheme("sr_robbery", "sr_robbery", ESchemeType.RESTRICTOR)
  // --loadScheme("sr_shooting", "sr_shooting", ESchemeType.RESTRICTOR)
  // --loadScheme("sr_survival", "sr_survival", ESchemeType.RESTRICTOR)
  loadScheme(ActionCrowSpawner, ActionCrowSpawner.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionCutscene, ActionCutscene.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionDeimos, ActionDeimos.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionIdle, ActionIdle.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionLight, ActionLight.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionMonster, ActionMonster.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionNoWeapon, ActionNoWeapon.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionParticle, ActionParticle.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionPostProcess, ActionPostProcess.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionPsyAntenna, ActionPsyAntenna.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionSilence, ActionSilence.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionTeleport, ActionTeleport.SCHEME_SECTION, ESchemeType.RESTRICTOR);
  loadScheme(ActionTimer, ActionTimer.SCHEME_SECTION, ESchemeType.RESTRICTOR);
}
