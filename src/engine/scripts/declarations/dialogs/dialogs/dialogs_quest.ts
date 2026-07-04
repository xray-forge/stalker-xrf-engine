import { $filename } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { extern } from "@/engine/core/utils/binding";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInjured, isStalkerAlive } from "@/engine/core/utils/object";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { GameObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind dialogs quest");

/**
 * Check whether the helicopter quest dialog should be available based on searched helicopters.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the helicopter quest dialog can be shown.
 */
extern("dialogs.quest_dialog_heli_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !(
    (hasInfoPortion(infoPortions.jup_b9_heli_1_searched) &&
      hasInfoPortion(infoPortions.zat_b100_heli_2_searched) &&
      hasInfoPortion(infoPortions.zat_b28_heli_3_searched) &&
      hasInfoPortion(infoPortions.jup_b8_heli_4_searched) &&
      hasInfoPortion(infoPortions.zat_b101_heli_5_searched)) ||
    hasInfoPortion(infoPortions.pri_b305_actor_wondered_done)
  );
});

/**
 * Check whether the military quest dialog should be available based on exactly one of the two clues.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the military quest dialog can be shown.
 */
extern("dialogs.quest_dialog_military_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.zat_b28_heli_3_searched) || hasInfoPortion(infoPortions.jup_b9_blackbox_decrypted)) {
    if (!(
      hasInfoPortion(infoPortions.zat_b28_heli_3_searched) && hasInfoPortion(infoPortions.jup_b9_blackbox_decrypted)
    )) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether the squad quest dialog should be available before all squad members are hired.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the squad quest dialog can be shown.
 */
extern("dialogs.quest_dialog_squad_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_b218_monolith_hired) &&
    hasInfoPortion(infoPortions.jup_b218_soldier_hired) &&
    hasInfoPortion(infoPortions.jup_a10_vano_agree_go_und)
  );
});

/**
 * Check whether the toolkits quest dialog should be available while a toolkit search task is active.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the toolkits quest dialog can be shown.
 */
extern("dialogs.quest_dialog_toolkits_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.zat_a2_mechanic_toolkit_search) && !hasInfoPortion(infoPortions.zat_b3_task_end)) {
    return true;
  } else if (
    hasInfoPortion(infoPortions.jup_b217_tech_instruments_start) &&
    !hasInfoPortion(infoPortions.jup_b217_task_end)
  ) {
    return true;
  }

  return false;
});

/**
 * Check whether the jup_b4 Monolith squad leader is alive for the faction skin they currently wear.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the Monolith squad leader is alive.
 */
extern("dialogs.monolith_leader_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (!(
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
  )) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return false;
});

/**
 * Check whether the Monolith squad leader is dead or the soldier squad has been hired.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the Monolith leader is dead or already hired.
 */
extern("dialogs.monolith_leader_dead_or_hired", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (!(
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
  )) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return true;
});

/**
 * Check whether the Monolith squad leader is dead, hired, or the squad already joined Freedom.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the Monolith leader is dead, hired, or the squad sided with Freedom.
 */
extern("dialogs.monolith_leader_dead_or_dolg", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (!(
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
  )) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return true;
  } else if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return true;
});

/**
 * Check whether the speaking NPC is not located in the zat_b101 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the zat_b101 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b101", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b101");
});

/**
 * Check whether the speaking NPC is not located in the zat_b103 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the zat_b103 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b103", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b103");
});

/**
 * Check whether the speaking NPC is not located in the zat_b104 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the zat_b104 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b104", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b104");
});

/**
 * Check whether the speaking NPC is not located in the jup_b213 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the jup_b213 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b213", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b213");
});

/**
 * Check whether the speaking NPC is not located in the jup_b214 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the jup_b214 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b214", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b214");
});

/**
 * Check whether the speaking NPC is not located in the pri_b304 monsters smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the pri_b304 monsters smart terrain.
 */
extern("dialogs.squad_not_in_smart_b304", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "pri_b304_monsters_smart_terrain");
});

/**
 * Check whether the speaking NPC is not located in the pri_b303 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the pri_b303 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b303", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "pri_b303");
});

/**
 * Check whether the speaking NPC is not located in the zat_b40 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the zat_b40 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b40", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b40_smart_terrain");
});

/**
 * Check whether the speaking NPC is not located in the zat_b18 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the zat_b18 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b18", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b18");
});

/**
 * Check whether the speaking NPC is not located in the jup_b41 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the jup_b41 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b6", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b41");
});

/**
 * Check whether the speaking NPC is not located in the jup_b205 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the jup_b205 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b205", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b205_smart_terrain");
});

/**
 * Check whether the speaking NPC is not located in the jup_b47 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is outside the jup_b47 smart terrain.
 */
extern("dialogs.squad_not_in_smart_b47", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b47");
});

/**
 * Check whether the speaking NPC is located in the Zaton stalker base smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is inside the Zaton stalker base smart terrain.
 */
extern("dialogs.squad_in_smart_zat_base", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_stalker_base_smart");
});

/**
 * Check whether the speaking NPC is located in the jup_a6 smart terrain.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the NPC is inside the jup_a6 smart terrain.
 */
extern("dialogs.squad_in_smart_jup_b25", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_a6");
});

/**
 * Check whether the stalker Spartak is still alive.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Spartak is alive.
 */
extern("dialogs.spartak_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b7_stalker_victim_1");
});

/**
 * Check whether the lost mercenary leader Tesak is still alive.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Tesak is alive.
 */
extern("dialogs.tesak_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b103_lost_merc_leader");
});

/**
 * Check whether the lost mercenary leader Gonta is still alive.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Gonta is alive.
 */
extern("dialogs.gonta_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b103_lost_merc_leader");
});

/**
 * Check whether the stalker Mityay is still alive.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Mityay is alive.
 */
extern("dialogs.mityay_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("jup_a12_stalker_assaulter");
});

/**
 * Check whether Duty can still take the scientists bunker job because Freedom has not taken it.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Duty can work for the scientists.
 */
extern("dialogs.dolg_can_work_for_sci", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work)
  );
});

/**
 * Check whether Duty can no longer take the scientists bunker job because Freedom already took it.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Duty cannot work for the scientists.
 */
extern("dialogs.dolg_can_not_work_for_sci", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work)
  );
});

/**
 * Check whether Freedom can still take the scientists bunker job because Duty has not taken it.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Freedom can work for the scientists.
 */
extern("dialogs.freedom_can_work_for_sci", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work)
  );
});

/**
 * Check whether Freedom can no longer take the scientists bunker job because Duty already took it.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Freedom cannot work for the scientists.
 */
extern("dialogs.freedom_can_not_work_for_sci", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work)
  );
});

/**
 * Check whether the Monolith squad leader is dead, hired, or the squad already joined Duty.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the Monolith leader is dead, hired, or the squad sided with Duty.
 */
extern("dialogs.monolith_leader_dead_or_freedom", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (!(
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
  )) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return true;
  }

  return true;
});

/**
 * Heal actor, stop bleeding and radiation, restore power.
 */
extern("dialogs.medic_magic_potion", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  actor.health = 1;
  actor.power = 1;
  actor.radiation = -1;
  actor.bleeding = 1;
});

/**
 * Check whether actor needs healing, radiation or bleeding help.
 */
extern("dialogs.actor_needs_bless", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInjured(registry.actor);
});

/**
 * Check whether actor is absolutely healthy, without bleeding and radiation contamination.
 */
extern("dialogs.actor_is_damn_healthy", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInjured(registry.actor);
});

/**
 * Create an auto-save when leaving the zone back to reality.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.leave_zone_save", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_zone_to_reality");
});

/**
 * Create an auto-save for travel from Zaton to Jupiter.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_uni_travel_zat_to_jup", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_zat_to_jup");
});

/**
 * Create an auto-save for travel from Zaton to Pripyat.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_uni_travel_zat_to_pri", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_zat_to_pri");
});

/**
 * Create an auto-save for travel from Jupiter to Zaton.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_uni_travel_jup_to_zat", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_jup_to_zat");
});

/**
 * Create an auto-save for travel from Jupiter to Pripyat.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_uni_travel_jup_to_pri", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_jup_to_pri");
});

/**
 * Create an auto-save for travel from Pripyat to Zaton.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_uni_travel_pri_to_zat", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_pri_to_zat");
});

/**
 * Create an auto-save for travel from Pripyat to Jupiter.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_uni_travel_pri_to_jup", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_pri_to_jup");
});

/**
 * Create an auto-save for the jup_b218 travel from Jupiter to the Pripyat underpass.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_jup_b218_travel_jup_to_pas", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b218_travel_jup_to_pas");
});

/**
 * Create an auto-save at the start of the pri_a17 hospital sequence.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_pri_a17_hospital_start", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_pri_a17_hospital_start");
});

/**
 * Create a one-time auto-save for the jup_a10 return-debt moment, guarded by an info portion.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_jup_a10_gonna_return_debt", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (!hasInfoPortion(infoPortions.jup_a10_avtosave)) {
    createGameAutoSave("st_save_jup_a10_gonna_return_debt");
    giveInfoPortion(infoPortions.jup_a10_avtosave);
  }
});

/**
 * Create an auto-save when arriving at the fen during the jup_b6 quest.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_jup_b6_arrived_to_fen", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b6_arrived_to_fen");
});

/**
 * Create an auto-save when arriving at the ash heap during the jup_b6 quest.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_jup_b6_arrived_to_ash_heap", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b6_arrived_to_ash_heap");
});

/**
 * Create an auto-save when arriving at Kopachy during the jup_b19 quest.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_jup_b19_arrived_to_kopachy", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b19_arrived_to_kopachy");
});

/**
 * Create an auto-save when arriving at the chimera lair during the zat_b106 quest.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_zat_b106_arrived_to_chimera_lair", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_zat_b106_arrived_to_chimera_lair");
});

/**
 * Create an auto-save when meeting the others during the zat_b5 quest.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs.save_zat_b5_met_with_others", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_zat_b5_met_with_others");
});
