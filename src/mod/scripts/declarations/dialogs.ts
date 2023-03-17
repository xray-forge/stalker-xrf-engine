/* eslint @typescript-eslint/explicit-function-return-type: "error" */

import { alife, game_object, level, XR_game_object } from "xray16";

import { captions } from "@/mod/globals/captions";
import { communities } from "@/mod/globals/communities";
import { info_portions } from "@/mod/globals/info_portions/info_portions";
import { drugs, TMedkit } from "@/mod/globals/items/drugs";
import { pistols, TPistol } from "@/mod/globals/items/weapons";
import { levels } from "@/mod/globals/levels";
import { AnyCallablesModule, EScheme, Optional, TNumberId } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { SimulationBoardManager } from "@/mod/scripts/core/database/SimulationBoardManager";
import { NotificationManager } from "@/mod/scripts/core/managers/notifications/NotificationManager";
import { SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { update_logic } from "@/mod/scripts/core/objects/binders/StalkerBinder";
import { ISchemeMeetState } from "@/mod/scripts/core/schemes/meet";
import { SchemeMeet } from "@/mod/scripts/core/schemes/meet/SchemeMeet";
import { ISchemeWoundedState } from "@/mod/scripts/core/schemes/wounded";
import { SchemeWounded } from "@/mod/scripts/core/schemes/wounded/SchemeWounded";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { isObjectWounded, isStalkerAlive } from "@/mod/scripts/utils/check/check";
import { createScenarioAutoSave } from "@/mod/scripts/utils/game_save";
import { getObjectBoundSmart } from "@/mod/scripts/utils/gulag";
import { giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/info_portion";
import {
  actorHasMedKit,
  getActorAvailableMedKit,
  getNpcSpeaker,
  relocateQuestItemSection,
} from "@/mod/scripts/utils/quest";

/**
 * todo;
 */
export function is_npc_in_current_smart(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object,
  smart_name: string
): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const smart = getObjectBoundSmart(npc);

  if (!smart) {
    return false;
  }

  return smart.name() === smart_name;
}

/**
 * todo;
 */
export function break_dialog(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  first_speaker.stop_talk();
  second_speaker.stop_talk();
}

/**
 * todo;
 */
export function update_npc_dialog(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const object = getNpcSpeaker(first_speaker, second_speaker);

  (registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState).meet_manager.update();
  SchemeMeet.updateObjectInteractionAvailability(object);
  update_logic(object);
}

/**
 * todo;
 */
export function is_wounded(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return isObjectWounded(getNpcSpeaker(first_speaker, second_speaker));
}

/**
 * todo;
 */
export function is_not_wounded(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_wounded(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function actor_have_medkit(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return actorHasMedKit();
}

/**
 * todo;
 */
export function actor_hasnt_medkit(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !actorHasMedKit();
}

/**
 * todo;
 */
export function transfer_medkit(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const availableMedkit: Optional<TMedkit> = getActorAvailableMedKit();

  if (availableMedkit !== null) {
    relocateQuestItemSection(second_speaker, availableMedkit, "out");
  }

  alife().create(
    "medkit_script",
    second_speaker.position(),
    second_speaker.level_vertex_id(),
    second_speaker.game_vertex_id(),
    second_speaker.id()
  );

  SchemeWounded.unlockMedkit(second_speaker);

  if (second_speaker.relation(first_speaker) !== game_object.enemy) {
    second_speaker.set_relation(game_object.friend, first_speaker);
  }

  first_speaker.change_character_reputation(10);
}

/**
 * todo;
 */
export function actor_have_bandage(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return first_speaker.object(drugs.bandage) !== null;
}

/**
 * todo;
 */
export function transfer_bandage(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  relocateQuestItemSection(second_speaker, drugs.bandage, "out");
  second_speaker.set_relation(game_object.friend, first_speaker);
}

/**
 * todo;
 */
export function kill_yourself(npc: XR_game_object, actor: XR_game_object): void {
  npc.kill(actor);
}

/**
 * todo;
 */
export function allow_wounded_dialog(object: XR_game_object, victim: XR_game_object, id: TNumberId): boolean {
  return (registry.objects.get(victim.id())[EScheme.WOUNDED] as ISchemeWoundedState)?.help_dialog === id;
}

/**
 * todo;
 */
export function level_zaton(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return level.name() === levels.zaton;
}

/**
 * todo;
 */
export function level_jupiter(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return level.name() === levels.jupiter;
}

/**
 * todo;
 */
export function level_pripyat(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return level.name() === levels.pripyat;
}

/**
 * todo;
 */
export function not_level_zaton(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return level.name() !== levels.zaton;
}

/**
 * todo;
 */
export function not_level_jupiter(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return level.name() !== levels.jupiter;
}

/**
 * todo;
 */
export function not_level_pripyat(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return level.name() !== levels.pripyat;
}

/**
 * todo;
 */
export function is_friend(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return first_speaker.relation(second_speaker) === game_object.friend;
}

/**
 * todo;
 */
export function is_not_friend(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_friend(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function become_friend(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  first_speaker.set_relation(game_object.friend, second_speaker);
}

/**
 * todo;
 */
export function actor_set_stalker(actor: XR_game_object, npc: XR_game_object): boolean {
  SimulationBoardManager.getInstance().set_actor_community(communities.stalker);

  return true;
}

/**
 * todo;
 */
export function actor_clear_community(actor: XR_game_object, npc: XR_game_object): boolean {
  SimulationBoardManager.getInstance().set_actor_community(communities.none);

  return true;
}

/**
 * todo;
 */
export function npc_stalker(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);

  return getCharacterCommunity(npc) === communities.stalker;
}

/**
 * todo;
 */
export function npc_bandit(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);

  return getCharacterCommunity(npc) === communities.bandit;
}

/**
 * todo;
 */
export function npc_freedom(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);

  return getCharacterCommunity(npc) === communities.freedom;
}

/**
 * todo;
 */
export function npc_dolg(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);

  return getCharacterCommunity(npc) === communities.dolg;
}

/**
 * todo;
 */
export function npc_army(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);

  return getCharacterCommunity(npc) === communities.army;
}

/**
 * todo;
 */
export function actor_set_dolg(actor: XR_game_object, npc: XR_game_object): boolean {
  SimulationBoardManager.getInstance().set_actor_community(communities.dolg);

  return true;
}

/**
 * todo;
 */
export function actor_in_dolg(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().players!) {
    if (v.community_player === true && v.player_name === communities.dolg) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_not_in_dolg(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().players!) {
    if (v.community_player === true && v.player_name === communities.dolg) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function actor_in_freedom(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().players!) {
    if (v.community_player === true && v.player_name === communities.freedom) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_not_in_freedom(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().players!) {
    if (v.community_player === true && v.player_name === communities.freedom) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function actor_set_freedom(actor: XR_game_object, npc: XR_game_object): boolean {
  SimulationBoardManager.getInstance().set_actor_community(communities.freedom);

  return true;
}

/**
 * todo;
 */
export function actor_in_bandit(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().players!) {
    if (v.community_player === true && v.player_name === communities.bandit) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_not_in_bandit(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().players!) {
    if (v.community_player === true && v.player_name === communities.bandit) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function actor_set_bandit(actor: XR_game_object, npc: XR_game_object): boolean {
  SimulationBoardManager.getInstance().set_actor_community(communities.bandit);

  return true;
}

/**
 * todo;
 */
export function actor_in_stalker(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().players!) {
    if (v.community_player === true && v.player_name === communities.stalker) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_not_in_stalker(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().players!) {
    if (v.community_player === true && v.player_name === communities.stalker) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function has_2000_money(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return first_speaker.money() >= 2000;
}

/**
 * todo;
 */
export function transfer_any_pistol_from_actor(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const pistol: Optional<TPistol> = get_npc_pistol(actor);

  if (pistol !== null) {
    actor.transfer_item(actor.object(pistol)!, npc);
    NotificationManager.getInstance().sendItemRelocatedNotification(actor, "out", pistol);
  }
}

/**
 * todo;
 */
export function get_npc_pistol(npc: XR_game_object): Optional<TPistol> {
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
export function have_actor_any_pistol(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return get_npc_pistol(registry.actor) !== null;
}

/**
 * todo;
 */
export function disable_ui(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  get_global<AnyCallablesModule>("xr_effects").disable_ui(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function disable_ui_only(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  get_global<AnyCallablesModule>("xr_effects").disable_ui_only(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function is_surge_running(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return SurgeManager.getInstance().isStarted;
}

/**
 * todo;
 */
export function is_surge_not_running(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return SurgeManager.getInstance().isFinished;
}

/**
 * todo;
 */
export function quest_dialog_heli_precond(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !(
    (hasAlifeInfo(info_portions.jup_b9_heli_1_searched) &&
      hasAlifeInfo(info_portions.zat_b100_heli_2_searched) &&
      hasAlifeInfo(info_portions.zat_b28_heli_3_searched) &&
      hasAlifeInfo(info_portions.jup_b8_heli_4_searched) &&
      hasAlifeInfo(info_portions.zat_b101_heli_5_searched)) ||
    hasAlifeInfo(info_portions.pri_b305_actor_wondered_done)
  );
}

/**
 * todo;
 */
export function quest_dialog_military_precond(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (hasAlifeInfo(info_portions.zat_b28_heli_3_searched) || hasAlifeInfo(info_portions.jup_b9_blackbox_decrypted)) {
    if (
      !(hasAlifeInfo(info_portions.zat_b28_heli_3_searched) && hasAlifeInfo(info_portions.jup_b9_blackbox_decrypted))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function quest_dialog_squad_precond(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !(
    hasAlifeInfo(info_portions.jup_b218_monolith_hired) &&
    hasAlifeInfo(info_portions.jup_b218_soldier_hired) &&
    hasAlifeInfo(info_portions.jup_a10_vano_agree_go_und)
  );
}

/**
 * todo;
 */
export function quest_dialog_toolkits_precond(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (hasAlifeInfo(info_portions.zat_a2_mechanic_toolkit_search) && !hasAlifeInfo(info_portions.zat_b3_task_end)) {
    return true;
  } else if (
    hasAlifeInfo(info_portions.jup_b217_tech_instruments_start) &&
    !hasAlifeInfo(info_portions.jup_b217_task_end)
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
export function monolith_leader_is_alive(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (
    !(
      hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom) ||
      hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty)
    )
  ) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom)) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty)) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return false;
}

/**
 * todo;
 */
export function monolith_leader_dead_or_hired(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (hasAlifeInfo(info_portions.jup_b218_soldier_hired)) {
    return true;
  }

  if (
    !(
      hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom) ||
      hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty)
    )
  ) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return true;
}

/**
 * todo;
 */
export function monolith_leader_dead_or_dolg(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  if (hasAlifeInfo(info_portions.jup_b218_soldier_hired)) {
    return true;
  }

  if (
    !(
      hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom) ||
      hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty)
    )
  ) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom)) {
    return true;
  } else if (hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return true;
}

/**
 * todo;
 */
export function squad_not_in_smart_b101(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "zat_b101");
}

/**
 * todo;
 */
export function squad_not_in_smart_b103(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "zat_b103");
}

/**
 * todo;
 */
export function squad_not_in_smart_b104(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "zat_b104");
}

/**
 * todo;
 */
export function squad_not_in_smart_b213(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "jup_b213");
}

/**
 * todo;
 */
export function squad_not_in_smart_b214(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "jup_b214");
}

/**
 * todo;
 */
export function squad_not_in_smart_b304(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "pri_b304_monsters_smart_terrain");
}

/**
 * todo;
 */
export function squad_not_in_smart_b303(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "pri_b303");
}

/**
 * todo;
 */
export function squad_not_in_smart_b40(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "zat_b40_smart_terrain");
}

/**
 * todo;
 */
export function squad_not_in_smart_b18(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "zat_b18");
}

/**
 * todo;
 */
export function squad_not_in_smart_b6(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "jup_b41");
}

/**
 * todo;
 */
export function squad_not_in_smart_b205(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "jup_b205_smart_terrain");
}

/**
 * todo;
 */
export function squad_not_in_smart_b47(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(first_speaker, second_speaker, "jup_b47");
}

/**
 * todo;
 */
export function squad_in_smart_zat_base(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return is_npc_in_current_smart(first_speaker, second_speaker, "zat_stalker_base_smart");
}

/**
 * todo;
 */
export function squad_in_smart_jup_b25(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return is_npc_in_current_smart(first_speaker, second_speaker, "jup_a6");
}

/**
 * todo;
 */
export function spartak_is_alive(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return isStalkerAlive("zat_b7_stalker_victim_1");
}

/**
 * todo;
 */
export function tesak_is_alive(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return isStalkerAlive("zat_b103_lost_merc_leader");
}

/**
 * todo;
 */
export function gonta_is_alive(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return isStalkerAlive("zat_b103_lost_merc_leader");
}

/**
 * todo;
 */
export function mityay_is_alive(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return isStalkerAlive("jup_a12_stalker_assaulter");
}

/**
 * todo;
 */
export function dolg_can_work_for_sci(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !(
    hasAlifeInfo(info_portions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasAlifeInfo(info_portions.jup_a6_freedom_leader_bunker_scan_work)
  );
}

/**
 * todo;
 */
export function dolg_can_not_work_for_sci(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return (
    hasAlifeInfo(info_portions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasAlifeInfo(info_portions.jup_a6_freedom_leader_bunker_scan_work)
  );
}

/**
 * todo;
 */
export function freedom_can_work_for_sci(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !(
    hasAlifeInfo(info_portions.jup_a6_duty_leader_bunker_guards_work) ||
    hasAlifeInfo(info_portions.jup_a6_duty_leader_bunker_scan_work)
  );
}

/**
 * todo;
 */
export function freedom_can_not_work_for_sci(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return (
    hasAlifeInfo(info_portions.jup_a6_duty_leader_bunker_guards_work) ||
    hasAlifeInfo(info_portions.jup_a6_duty_leader_bunker_scan_work)
  );
}

/**
 * todo;
 */
export function monolith_leader_dead_or_freedom(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): boolean {
  if (hasAlifeInfo(info_portions.jup_b218_soldier_hired)) {
    return true;
  }

  if (
    !(
      hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom) ||
      hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty)
    )
  ) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty)) {
    return true;
  }

  return true;
}

/**
 * todo;
 */
export function medic_magic_potion(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;

  actor.health = 1;
  actor.power = 1;
  actor.radiation = -1;
  actor.bleeding = 1;
}

/**
 * todo;
 */
export function actor_needs_bless(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;

  return actor.health < 1 || actor.radiation > 0 || actor.bleeding > 0;
}

/**
 * todo;
 */
export function actor_is_damn_healthy(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  return !actor_needs_bless(first_speaker, second_speaker);
}

/**
 * todo;
 */
export function leave_zone_save(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_uni_zone_to_reality);
}

/**
 * todo;
 */
export function save_uni_travel_zat_to_jup(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_uni_travel_zat_to_jup);
}

/**
 * todo;
 */
export function save_uni_travel_zat_to_pri(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_uni_travel_zat_to_pri);
}

/**
 * todo;
 */
export function save_uni_travel_jup_to_zat(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_uni_travel_jup_to_zat);
}

/**
 * todo;
 */
export function save_uni_travel_jup_to_pri(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_uni_travel_jup_to_pri);
}

/**
 * todo;
 */
export function save_uni_travel_pri_to_zat(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_uni_travel_pri_to_zat);
}

/**
 * todo;
 */
export function save_uni_travel_pri_to_jup(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_uni_travel_pri_to_jup);
}

/**
 * todo;
 */
export function save_jup_b218_travel_jup_to_pas(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_jup_b218_travel_jup_to_pas);
}

/**
 * todo;
 */
export function save_pri_a17_hospital_start(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_pri_a17_hospital_start);
}

/**
 * todo;
 */
export function save_jup_a10_gonna_return_debt(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  if (!hasAlifeInfo(info_portions.jup_a10_avtosave)) {
    createScenarioAutoSave(captions.st_save_jup_a10_gonna_return_debt);
    giveInfo(info_portions.jup_a10_avtosave);
  }
}

/**
 * todo;
 */
export function save_jup_b6_arrived_to_fen(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_jup_b6_arrived_to_fen);
}

/**
 * todo;
 */
export function save_jup_b6_arrived_to_ash_heap(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_jup_b6_arrived_to_ash_heap);
}

/**
 * todo;
 */
export function save_jup_b19_arrived_to_kopachy(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  createScenarioAutoSave(captions.st_save_jup_b19_arrived_to_kopachy);
}

/**
 * todo;
 */
export function save_zat_b106_arrived_to_chimera_lair(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object
): void {
  createScenarioAutoSave(captions.st_save_zat_b106_arrived_to_chimera_lair);
}

/**
 * todo;
 */
export function save_zat_b5_met_with_others(first_speaker: XR_game_object, second_speaker: XR_game_object): void {
  get_global<AnyCallablesModule>("xr_effects").scenario_autosave(registry.actor, null, [
    "st_save_zat_b5_met_with_others",
  ]);
}
