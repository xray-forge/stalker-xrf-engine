import { alife, level } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { ActorInputManager } from "@/engine/core/managers/interface";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/interface/notifications";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { updateStalkerLogic } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { ISchemeMeetState } from "@/engine/core/schemes/meet";
import { SchemeMeet } from "@/engine/core/schemes/meet/SchemeMeet";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { SchemeWounded } from "@/engine/core/schemes/wounded/SchemeWounded";
import { extern } from "@/engine/core/utils/binding";
import { createGameAutoSave } from "@/engine/core/utils/game";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  actorHasMedKit,
  getActorAvailableMedKit,
  getNpcSpeaker,
  getObjectCommunity,
  giveInfo,
  hasAlifeInfo,
  isObjectInjured,
  isObjectInSmartTerrain,
  isObjectWounded,
  isStalkerAlive,
  transferItemsFromActor,
} from "@/engine/core/utils/object";
import { captions } from "@/engine/lib/constants/captions/captions";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { drugs, TMedkit } from "@/engine/lib/constants/items/drugs";
import { pistols, TPistol } from "@/engine/lib/constants/items/weapons";
import { levels } from "@/engine/lib/constants/levels";
import { ClientObject, EClientObjectRelation, EScheme, Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

extern("dialogs", {});

/**
 * todo;
 */
extern("dialogs.break_dialog", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  firstSpeaker.stop_talk();
  secondSpeaker.stop_talk();
});

/**
 * todo;
 */
extern("dialogs.update_npc_dialog", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  const object: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);

  (registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState).meetManager.update();
  SchemeMeet.updateObjectInteractionAvailability(object);
  updateStalkerLogic(object);
});

/**
 * todo;
 */
extern("dialogs.is_wounded", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return isObjectWounded(getNpcSpeaker(firstSpeaker, secondSpeaker).id());
});

/**
 * todo;
 */
extern("dialogs.is_not_wounded", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectWounded(getNpcSpeaker(firstSpeaker, secondSpeaker).id());
});

/**
 * todo;
 */
extern("dialogs.actor_have_medkit", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return actorHasMedKit();
});

/**
 * todo;
 */
extern("dialogs.actor_hasnt_medkit", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !actorHasMedKit();
});

/**
 * todo;
 */
extern("dialogs.transfer_medkit", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  const availableMedkit: Optional<TMedkit> = getActorAvailableMedKit();

  if (availableMedkit !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), availableMedkit);
  }

  alife().create(
    "medkit_script",
    secondSpeaker.position(),
    secondSpeaker.level_vertex_id(),
    secondSpeaker.game_vertex_id(),
    secondSpeaker.id()
  );

  SchemeWounded.unlockMedkit(secondSpeaker);

  if (secondSpeaker.relation(firstSpeaker) !== EClientObjectRelation.ENEMY) {
    secondSpeaker.set_relation(EClientObjectRelation.FRIEND, firstSpeaker);
  }

  firstSpeaker.change_character_reputation(10);
});

/**
 * todo;
 */
extern("dialogs.actor_have_bandage", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return firstSpeaker.object(drugs.bandage) !== null;
});

/**
 * todo;
 */
extern("dialogs.transfer_bandage", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.bandage);
  secondSpeaker.set_relation(EClientObjectRelation.FRIEND, firstSpeaker);
});

/**
 * todo;
 */
extern("dialogs.kill_yourself", (npc: ClientObject, actor: ClientObject): void => {
  npc.kill(actor);
});

/**
 * todo;
 */
extern("dialogs.allow_wounded_dialog", (object: ClientObject, victim: ClientObject, id: TNumberId): boolean => {
  return (registry.objects.get(victim.id())[EScheme.WOUNDED] as ISchemeWoundedState)?.help_dialog === id;
});

/**
 * todo;
 */
extern("dialogs.level_zaton", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return level.name() === levels.zaton;
});

/**
 * todo;
 */
extern("dialogs.level_jupiter", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return level.name() === levels.jupiter;
});

/**
 * todo;
 */
extern("dialogs.level_pripyat", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return level.name() === levels.pripyat;
});

/**
 * todo;
 */
extern("dialogs.not_level_zaton", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return level.name() !== levels.zaton;
});

/**
 * todo;
 */
extern("dialogs.not_level_jupiter", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return level.name() !== levels.jupiter;
});

/**
 * todo;
 */
extern("dialogs.not_level_pripyat", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return level.name() !== levels.pripyat;
});

/**
 * todo;
 */
extern("dialogs.is_friend", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return firstSpeaker.relation(secondSpeaker) === EClientObjectRelation.FRIEND;
});

/**
 * todo;
 */
extern("dialogs.is_not_friend", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return firstSpeaker.relation(secondSpeaker) !== EClientObjectRelation.FRIEND;
});

/**
 * todo;
 */
extern("dialogs.become_friend", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  firstSpeaker.set_relation(EClientObjectRelation.FRIEND, secondSpeaker);
});

/**
 * todo;
 */
extern("dialogs.npc_stalker", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.stalker;
});

/**
 * todo;
 */
extern("dialogs.npc_bandit", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.bandit;
});

/**
 * todo;
 */
extern("dialogs.npc_freedom", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.freedom;
});

/**
 * todo;
 */
extern("dialogs.npc_dolg", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.dolg;
});

/**
 * todo;
 */
extern("dialogs.npc_army", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)) === communities.army;
});

/**
 * todo;
 */
extern("dialogs.actor_in_dolg", (actor: ClientObject, npc: ClientObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.dolg) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.actor_not_in_dolg", (actor: ClientObject, npc: ClientObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.dolg) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.actor_in_freedom", (actor: ClientObject, npc: ClientObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.freedom) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.actor_not_in_freedom", (actor: ClientObject, npc: ClientObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.freedom) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.actor_in_bandit", (actor: ClientObject, npc: ClientObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.bandit) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.actor_not_in_bandit", (actor: ClientObject, npc: ClientObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.bandit) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.actor_in_stalker", (actor: ClientObject, npc: ClientObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.stalker) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.actor_not_in_stalker", (actor: ClientObject, npc: ClientObject): boolean => {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity && v.name === communities.stalker) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.has_2000_money", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return firstSpeaker.money() >= 2000;
});

/**
 * todo;
 */
extern("dialogs.transfer_any_pistol_from_actor", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  const actor: ClientObject = registry.actor;
  const npc: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const pistol: Optional<TPistol> = getNpcPistol(actor);

  if (pistol !== null) {
    actor.transfer_item(actor.object(pistol)!, npc);
    NotificationManager.getInstance().sendItemRelocatedNotification(ENotificationDirection.OUT, pistol);
  }
});

/**
 * todo;
 */
function getNpcPistol(npc: ClientObject): Optional<TPistol> {
  let pistol: Optional<TPistol> = null;

  npc.iterate_inventory((owner, item) => {
    const section: TPistol = item.section();

    if (pistols[section] !== null) {
      pistol = section;
    }
  }, npc);

  return pistol;
}

/**
 * todo;
 */
extern("dialogs.have_actor_any_pistol", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return getNpcPistol(registry.actor) !== null;
});

/**
 * todo;
 */
extern("dialogs.disable_ui", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  ActorInputManager.getInstance().disableGameUi(firstSpeaker, false);
});

/**
 * todo;
 */
extern("dialogs.disable_ui_only", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  ActorInputManager.getInstance().disableGameUi(firstSpeaker, false);
});

/**
 * todo;
 */
extern("dialogs.is_surge_running", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return SurgeManager.getInstance().isStarted;
});

/**
 * todo;
 */
extern("dialogs.is_surge_not_running", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return SurgeManager.getInstance().isFinished;
});

/**
 * todo;
 */
extern("dialogs.quest_dialog_heli_precond", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !(
    (hasAlifeInfo(infoPortions.jup_b9_heli_1_searched) &&
      hasAlifeInfo(infoPortions.zat_b100_heli_2_searched) &&
      hasAlifeInfo(infoPortions.zat_b28_heli_3_searched) &&
      hasAlifeInfo(infoPortions.jup_b8_heli_4_searched) &&
      hasAlifeInfo(infoPortions.zat_b101_heli_5_searched)) ||
    hasAlifeInfo(infoPortions.pri_b305_actor_wondered_done)
  );
});

/**
 * todo;
 */
extern("dialogs.quest_dialog_military_precond", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  if (hasAlifeInfo(infoPortions.zat_b28_heli_3_searched) || hasAlifeInfo(infoPortions.jup_b9_blackbox_decrypted)) {
    if (!(hasAlifeInfo(infoPortions.zat_b28_heli_3_searched) && hasAlifeInfo(infoPortions.jup_b9_blackbox_decrypted))) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.quest_dialog_squad_precond", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !(
    hasAlifeInfo(infoPortions.jup_b218_monolith_hired) &&
    hasAlifeInfo(infoPortions.jup_b218_soldier_hired) &&
    hasAlifeInfo(infoPortions.jup_a10_vano_agree_go_und)
  );
});

/**
 * todo;
 */
extern("dialogs.quest_dialog_toolkits_precond", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  if (hasAlifeInfo(infoPortions.zat_a2_mechanic_toolkit_search) && !hasAlifeInfo(infoPortions.zat_b3_task_end)) {
    return true;
  } else if (
    hasAlifeInfo(infoPortions.jup_b217_tech_instruments_start) &&
    !hasAlifeInfo(infoPortions.jup_b217_task_end)
  ) {
    return true;
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.monolith_leader_is_alive", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  if (
    !(
      hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_freedom) ||
      hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_duty)
    )
  ) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.monolith_leader_dead_or_hired", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  if (hasAlifeInfo(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (
    !(
      hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_freedom) ||
      hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_duty)
    )
  ) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.monolith_leader_dead_or_dolg", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  if (hasAlifeInfo(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (
    !(
      hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_freedom) ||
      hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_duty)
    )
  ) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return true;
  } else if (hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return true;
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b101", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b101");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b103", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b103");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b104", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b104");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b213", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b213");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b214", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b214");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b304", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "pri_b304_monsters_smart_terrain");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b303", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "pri_b303");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b40", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b40_smart_terrain");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b18", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b18");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b6", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b41");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b205", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b205_smart_terrain");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b47", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b47");
});

/**
 * todo;
 */
extern("dialogs.squad_in_smart_zat_base", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_stalker_base_smart");
});

/**
 * todo;
 */
extern("dialogs.squad_in_smart_jup_b25", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_a6");
});

/**
 * todo;
 */
extern("dialogs.spartak_is_alive", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return isStalkerAlive("zat_b7_stalker_victim_1");
});

/**
 * todo;
 */
extern("dialogs.tesak_is_alive", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return isStalkerAlive("zat_b103_lost_merc_leader");
});

/**
 * todo;
 */
extern("dialogs.gonta_is_alive", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return isStalkerAlive("zat_b103_lost_merc_leader");
});

/**
 * todo;
 */
extern("dialogs.mityay_is_alive", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return isStalkerAlive("jup_a12_stalker_assaulter");
});

/**
 * todo;
 */
extern("dialogs.dolg_can_work_for_sci", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !(
    hasAlifeInfo(infoPortions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasAlifeInfo(infoPortions.jup_a6_freedom_leader_bunker_scan_work)
  );
});

/**
 * todo;
 */
extern("dialogs.dolg_can_not_work_for_sci", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return (
    hasAlifeInfo(infoPortions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasAlifeInfo(infoPortions.jup_a6_freedom_leader_bunker_scan_work)
  );
});

/**
 * todo;
 */
extern("dialogs.freedom_can_work_for_sci", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !(
    hasAlifeInfo(infoPortions.jup_a6_duty_leader_bunker_guards_work) ||
    hasAlifeInfo(infoPortions.jup_a6_duty_leader_bunker_scan_work)
  );
});

/**
 * todo;
 */
extern("dialogs.freedom_can_not_work_for_sci", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return (
    hasAlifeInfo(infoPortions.jup_a6_duty_leader_bunker_guards_work) ||
    hasAlifeInfo(infoPortions.jup_a6_duty_leader_bunker_scan_work)
  );
});

/**
 * todo;
 */
extern(
  "dialogs.monolith_leader_dead_or_freedom",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    if (hasAlifeInfo(infoPortions.jup_b218_soldier_hired)) {
      return true;
    }

    if (
      !(
        hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_freedom) ||
        hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_duty)
      )
    ) {
      return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
    }

    if (hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_freedom)) {
      return !isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
    } else if (hasAlifeInfo(infoPortions.jup_b4_monolith_squad_in_duty)) {
      return true;
    }

    return true;
  }
);

/**
 * Heal actor, stop bleeding and radiation, restore power.
 */
extern("dialogs.medic_magic_potion", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  const actor: ClientObject = registry.actor;

  actor.health = 1;
  actor.power = 1;
  actor.radiation = -1;
  actor.bleeding = 1;
});

/**
 * Check whether actor needs healing, radiation or bleeding help.
 */
extern("dialogs.actor_needs_bless", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return isObjectInjured(registry.actor);
});

/**
 * Check whether actor is absolutely healthy, without bleeding and radiation contamination.
 */
extern("dialogs.actor_is_damn_healthy", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return !isObjectInjured(registry.actor);
});

/**
 * todo;
 */
extern("dialogs.leave_zone_save", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_uni_zone_to_reality);
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_zat_to_jup", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_uni_travel_zat_to_jup);
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_zat_to_pri", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_uni_travel_zat_to_pri);
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_jup_to_zat", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_uni_travel_jup_to_zat);
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_jup_to_pri", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_uni_travel_jup_to_pri);
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_pri_to_zat", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_uni_travel_pri_to_zat);
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_pri_to_jup", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_uni_travel_pri_to_jup);
});

/**
 * todo;
 */
extern("dialogs.save_jup_b218_travel_jup_to_pas", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_jup_b218_travel_jup_to_pas);
});

/**
 * todo;
 */
extern("dialogs.save_pri_a17_hospital_start", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_pri_a17_hospital_start);
});

/**
 * todo;
 */
extern("dialogs.save_jup_a10_gonna_return_debt", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  if (!hasAlifeInfo(infoPortions.jup_a10_avtosave)) {
    createGameAutoSave(captions.st_save_jup_a10_gonna_return_debt);
    giveInfo(infoPortions.jup_a10_avtosave);
  }
});

/**
 * todo;
 */
extern("dialogs.save_jup_b6_arrived_to_fen", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_jup_b6_arrived_to_fen);
});

/**
 * todo;
 */
extern("dialogs.save_jup_b6_arrived_to_ash_heap", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_jup_b6_arrived_to_ash_heap);
});

/**
 * todo;
 */
extern("dialogs.save_jup_b19_arrived_to_kopachy", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_jup_b19_arrived_to_kopachy);
});

/**
 * todo;
 */
extern(
  "dialogs.save_zat_b106_arrived_to_chimera_lair",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    createGameAutoSave(captions.st_save_zat_b106_arrived_to_chimera_lair);
  }
);

/**
 * todo;
 */
extern("dialogs.save_zat_b5_met_with_others", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  createGameAutoSave(captions.st_save_zat_b5_met_with_others);
});
