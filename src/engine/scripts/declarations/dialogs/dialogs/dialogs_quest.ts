import { registry } from "@/engine/core/database";
import { extern } from "@/engine/core/utils/binding";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectInjured, isStalkerAlive } from "@/engine/core/utils/object";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { GameObject } from "@/engine/lib/types";

/**
 * todo;
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
 * todo;
 */
extern("dialogs.quest_dialog_military_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.zat_b28_heli_3_searched) || hasInfoPortion(infoPortions.jup_b9_blackbox_decrypted)) {
    if (
      !(hasInfoPortion(infoPortions.zat_b28_heli_3_searched) && hasInfoPortion(infoPortions.jup_b9_blackbox_decrypted))
    ) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("dialogs.quest_dialog_squad_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_b218_monolith_hired) &&
    hasInfoPortion(infoPortions.jup_b218_soldier_hired) &&
    hasInfoPortion(infoPortions.jup_a10_vano_agree_go_und)
  );
});

/**
 * todo;
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
 * todo;
 */
extern("dialogs.monolith_leader_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (
    !(
      hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
      hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
    )
  ) {
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
 * todo;
 */
extern("dialogs.monolith_leader_dead_or_hired", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (
    !(
      hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
      hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
    )
  ) {
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
 * todo;
 */
extern("dialogs.monolith_leader_dead_or_dolg", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (
    !(
      hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
      hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
    )
  ) {
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
 * todo;
 */
extern("dialogs.squad_not_in_smart_b101", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b101");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b103", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b103");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b104", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b104");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b213", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b213");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b214", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b214");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b304", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "pri_b304_monsters_smart_terrain");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b303", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "pri_b303");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b40", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b40_smart_terrain");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b18", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_b18");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b6", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b41");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b205", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b205_smart_terrain");
});

/**
 * todo;
 */
extern("dialogs.squad_not_in_smart_b47", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b47");
});

/**
 * todo;
 */
extern("dialogs.squad_in_smart_zat_base", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "zat_stalker_base_smart");
});

/**
 * todo;
 */
extern("dialogs.squad_in_smart_jup_b25", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_a6");
});

/**
 * todo;
 */
extern("dialogs.spartak_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b7_stalker_victim_1");
});

/**
 * todo;
 */
extern("dialogs.tesak_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b103_lost_merc_leader");
});

/**
 * todo;
 */
extern("dialogs.gonta_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b103_lost_merc_leader");
});

/**
 * todo;
 */
extern("dialogs.mityay_is_alive", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("jup_a12_stalker_assaulter");
});

/**
 * todo;
 */
extern("dialogs.dolg_can_work_for_sci", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work)
  );
});

/**
 * todo;
 */
extern("dialogs.dolg_can_not_work_for_sci", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work)
  );
});

/**
 * todo;
 */
extern("dialogs.freedom_can_work_for_sci", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work)
  );
});

/**
 * todo;
 */
extern("dialogs.freedom_can_not_work_for_sci", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work)
  );
});

/**
 * todo;
 */
extern("dialogs.monolith_leader_dead_or_freedom", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (
    !(
      hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
      hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
    )
  ) {
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
 * todo;
 */
extern("dialogs.leave_zone_save", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_zone_to_reality");
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_zat_to_jup", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_zat_to_jup");
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_zat_to_pri", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_zat_to_pri");
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_jup_to_zat", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_jup_to_zat");
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_jup_to_pri", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_jup_to_pri");
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_pri_to_zat", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_pri_to_zat");
});

/**
 * todo;
 */
extern("dialogs.save_uni_travel_pri_to_jup", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_pri_to_jup");
});

/**
 * todo;
 */
extern("dialogs.save_jup_b218_travel_jup_to_pas", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b218_travel_jup_to_pas");
});

/**
 * todo;
 */
extern("dialogs.save_pri_a17_hospital_start", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_pri_a17_hospital_start");
});

/**
 * todo;
 */
extern("dialogs.save_jup_a10_gonna_return_debt", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (!hasInfoPortion(infoPortions.jup_a10_avtosave)) {
    createGameAutoSave("st_save_jup_a10_gonna_return_debt");
    giveInfoPortion(infoPortions.jup_a10_avtosave);
  }
});

/**
 * todo;
 */
extern("dialogs.save_jup_b6_arrived_to_fen", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b6_arrived_to_fen");
});

/**
 * todo;
 */
extern("dialogs.save_jup_b6_arrived_to_ash_heap", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b6_arrived_to_ash_heap");
});

/**
 * todo;
 */
extern("dialogs.save_jup_b19_arrived_to_kopachy", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b19_arrived_to_kopachy");
});

/**
 * todo;
 */
extern("dialogs.save_zat_b106_arrived_to_chimera_lair", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_zat_b106_arrived_to_chimera_lair");
});

/**
 * todo;
 */
extern("dialogs.save_zat_b5_met_with_others", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_zat_b5_met_with_others");
});
