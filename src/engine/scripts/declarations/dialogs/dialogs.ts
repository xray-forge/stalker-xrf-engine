/* eslint @typescript-eslint/explicit-function-return-type: "error" */

import { alife, game_object, level, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { SurgeManager } from "@/engine/core/managers/SurgeManager";
import { update_logic } from "@/engine/core/objects/binders/StalkerBinder";
import { ISchemeMeetState } from "@/engine/core/schemes/meet";
import { SchemeMeet } from "@/engine/core/schemes/meet/SchemeMeet";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { SchemeWounded } from "@/engine/core/schemes/wounded/SchemeWounded";
import { getExtern } from "@/engine/core/utils/binding";
import { isObjectWounded, isStalkerAlive } from "@/engine/core/utils/check/check";
import { disableGameUi } from "@/engine/core/utils/control";
import { createAutoSave } from "@/engine/core/utils/game_save";
import { getObjectBoundSmart } from "@/engine/core/utils/gulag";
import { giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { getCharacterCommunity } from "@/engine/core/utils/object";
import {
  actorHasMedKit,
  getActorAvailableMedKit,
  getNpcSpeaker,
  relocateQuestItemSection,
} from "@/engine/core/utils/quest_reward";
import { captions } from "@/engine/lib/constants/captions/captions";
import { communities } from "@/engine/lib/constants/communities";
import { info_portions } from "@/engine/lib/constants/info_portions/info_portions";
import { drugs, TMedkit } from "@/engine/lib/constants/items/drugs";
import { pistols, TPistol } from "@/engine/lib/constants/items/weapons";
import { levels } from "@/engine/lib/constants/levels";
import { AnyCallablesModule, EScheme, Optional, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export function is_npc_in_current_smart(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object,
  smart_name: string
): boolean {
  const npc = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const smart = getObjectBoundSmart(npc);

  if (!smart) {
    return false;
  }

  return smart.name() === smart_name;
}

/**
 * todo;
 */
export function break_dialog(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  firstSpeaker.stop_talk();
  secondSpeaker.stop_talk();
}

/**
 * todo;
 */
export function update_npc_dialog(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const object = getNpcSpeaker(firstSpeaker, secondSpeaker);

  (registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState).meetManager.update();
  SchemeMeet.updateObjectInteractionAvailability(object);
  update_logic(object);
}

/**
 * todo;
 */
export function is_wounded(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return isObjectWounded(getNpcSpeaker(firstSpeaker, secondSpeaker));
}

/**
 * todo;
 */
export function is_not_wounded(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_wounded(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function actor_have_medkit(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return actorHasMedKit();
}

/**
 * todo;
 */
export function actor_hasnt_medkit(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !actorHasMedKit();
}

/**
 * todo;
 */
export function transfer_medkit(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const availableMedkit: Optional<TMedkit> = getActorAvailableMedKit();

  if (availableMedkit !== null) {
    relocateQuestItemSection(secondSpeaker, availableMedkit, ENotificationDirection.OUT);
  }

  alife().create(
    "medkit_script",
    secondSpeaker.position(),
    secondSpeaker.level_vertex_id(),
    secondSpeaker.game_vertex_id(),
    secondSpeaker.id()
  );

  SchemeWounded.unlockMedkit(secondSpeaker);

  if (secondSpeaker.relation(firstSpeaker) !== game_object.enemy) {
    secondSpeaker.set_relation(game_object.friend, firstSpeaker);
  }

  firstSpeaker.change_character_reputation(10);
}

/**
 * todo;
 */
export function actor_have_bandage(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return firstSpeaker.object(drugs.bandage) !== null;
}

/**
 * todo;
 */
export function transfer_bandage(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  relocateQuestItemSection(secondSpeaker, drugs.bandage, ENotificationDirection.OUT);
  secondSpeaker.set_relation(game_object.friend, firstSpeaker);
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
export function level_zaton(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return level.name() === levels.zaton;
}

/**
 * todo;
 */
export function level_jupiter(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return level.name() === levels.jupiter;
}

/**
 * todo;
 */
export function level_pripyat(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return level.name() === levels.pripyat;
}

/**
 * todo;
 */
export function not_level_zaton(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return level.name() !== levels.zaton;
}

/**
 * todo;
 */
export function not_level_jupiter(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return level.name() !== levels.jupiter;
}

/**
 * todo;
 */
export function not_level_pripyat(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return level.name() !== levels.pripyat;
}

/**
 * todo;
 */
export function is_friend(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return firstSpeaker.relation(secondSpeaker) === game_object.friend;
}

/**
 * todo;
 */
export function is_not_friend(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_friend(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function become_friend(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  firstSpeaker.set_relation(game_object.friend, secondSpeaker);
}

/**
 * todo;
 */
export function npc_stalker(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(firstSpeaker, secondSpeaker);

  return getCharacterCommunity(npc) === communities.stalker;
}

/**
 * todo;
 */
export function npc_bandit(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(firstSpeaker, secondSpeaker);

  return getCharacterCommunity(npc) === communities.bandit;
}

/**
 * todo;
 */
export function npc_freedom(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(firstSpeaker, secondSpeaker);

  return getCharacterCommunity(npc) === communities.freedom;
}

/**
 * todo;
 */
export function npc_dolg(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(firstSpeaker, secondSpeaker);

  return getCharacterCommunity(npc) === communities.dolg;
}

/**
 * todo;
 */
export function npc_army(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(firstSpeaker, secondSpeaker);

  return getCharacterCommunity(npc) === communities.army;
}

/**
 * todo;
 */
export function actor_in_dolg(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.dolg) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_not_in_dolg(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.dolg) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function actor_in_freedom(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.freedom) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_not_in_freedom(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.freedom) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function actor_in_bandit(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.bandit) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_not_in_bandit(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.bandit) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function actor_in_stalker(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity === true && v.name === communities.stalker) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function actor_not_in_stalker(actor: XR_game_object, npc: XR_game_object): boolean {
  for (const [k, v] of SimulationBoardManager.getInstance().getFactions()) {
    if (v.isCommunity && v.name === communities.stalker) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function has_2000_money(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return firstSpeaker.money() >= 2000;
}

/**
 * todo;
 */
export function transfer_any_pistol_from_actor(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;
  const npc = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const pistol: Optional<TPistol> = get_npc_pistol(actor);

  if (pistol !== null) {
    actor.transfer_item(actor.object(pistol)!, npc);
    NotificationManager.getInstance().sendItemRelocatedNotification(actor, ENotificationDirection.OUT, pistol);
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
export function have_actor_any_pistol(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return get_npc_pistol(registry.actor) !== null;
}

/**
 * todo;
 */
export function disable_ui(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  disableGameUi(firstSpeaker, false);
}

/**
 * todo;
 */
export function disable_ui_only(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  disableGameUi(firstSpeaker, false);
}

/**
 * todo;
 */
export function is_surge_running(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return SurgeManager.getInstance().isStarted;
}

/**
 * todo;
 */
export function is_surge_not_running(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return SurgeManager.getInstance().isFinished;
}

/**
 * todo;
 */
export function quest_dialog_heli_precond(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
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
export function quest_dialog_military_precond(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
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
export function quest_dialog_squad_precond(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !(
    hasAlifeInfo(info_portions.jup_b218_monolith_hired) &&
    hasAlifeInfo(info_portions.jup_b218_soldier_hired) &&
    hasAlifeInfo(info_portions.jup_a10_vano_agree_go_und)
  );
}

/**
 * todo;
 */
export function quest_dialog_toolkits_precond(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
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
export function monolith_leader_is_alive(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
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
export function monolith_leader_dead_or_hired(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
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
export function monolith_leader_dead_or_dolg(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
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
export function squad_not_in_smart_b101(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "zat_b101");
}

/**
 * todo;
 */
export function squad_not_in_smart_b103(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "zat_b103");
}

/**
 * todo;
 */
export function squad_not_in_smart_b104(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "zat_b104");
}

/**
 * todo;
 */
export function squad_not_in_smart_b213(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "jup_b213");
}

/**
 * todo;
 */
export function squad_not_in_smart_b214(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "jup_b214");
}

/**
 * todo;
 */
export function squad_not_in_smart_b304(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "pri_b304_monsters_smart_terrain");
}

/**
 * todo;
 */
export function squad_not_in_smart_b303(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "pri_b303");
}

/**
 * todo;
 */
export function squad_not_in_smart_b40(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "zat_b40_smart_terrain");
}

/**
 * todo;
 */
export function squad_not_in_smart_b18(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "zat_b18");
}

/**
 * todo;
 */
export function squad_not_in_smart_b6(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "jup_b41");
}

/**
 * todo;
 */
export function squad_not_in_smart_b205(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "jup_b205_smart_terrain");
}

/**
 * todo;
 */
export function squad_not_in_smart_b47(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !is_npc_in_current_smart(firstSpeaker, secondSpeaker, "jup_b47");
}

/**
 * todo;
 */
export function squad_in_smart_zat_base(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return is_npc_in_current_smart(firstSpeaker, secondSpeaker, "zat_stalker_base_smart");
}

/**
 * todo;
 */
export function squad_in_smart_jup_b25(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return is_npc_in_current_smart(firstSpeaker, secondSpeaker, "jup_a6");
}

/**
 * todo;
 */
export function spartak_is_alive(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return isStalkerAlive("zat_b7_stalker_victim_1");
}

/**
 * todo;
 */
export function tesak_is_alive(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return isStalkerAlive("zat_b103_lost_merc_leader");
}

/**
 * todo;
 */
export function gonta_is_alive(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return isStalkerAlive("zat_b103_lost_merc_leader");
}

/**
 * todo;
 */
export function mityay_is_alive(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return isStalkerAlive("jup_a12_stalker_assaulter");
}

/**
 * todo;
 */
export function dolg_can_work_for_sci(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !(
    hasAlifeInfo(info_portions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasAlifeInfo(info_portions.jup_a6_freedom_leader_bunker_scan_work)
  );
}

/**
 * todo;
 */
export function dolg_can_not_work_for_sci(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return (
    hasAlifeInfo(info_portions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasAlifeInfo(info_portions.jup_a6_freedom_leader_bunker_scan_work)
  );
}

/**
 * todo;
 */
export function freedom_can_work_for_sci(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !(
    hasAlifeInfo(info_portions.jup_a6_duty_leader_bunker_guards_work) ||
    hasAlifeInfo(info_portions.jup_a6_duty_leader_bunker_scan_work)
  );
}

/**
 * todo;
 */
export function freedom_can_not_work_for_sci(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return (
    hasAlifeInfo(info_portions.jup_a6_duty_leader_bunker_guards_work) ||
    hasAlifeInfo(info_portions.jup_a6_duty_leader_bunker_scan_work)
  );
}

/**
 * todo;
 */
export function monolith_leader_dead_or_freedom(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
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
export function medic_magic_potion(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  const actor: XR_game_object = registry.actor;

  actor.health = 1;
  actor.power = 1;
  actor.radiation = -1;
  actor.bleeding = 1;
}

/**
 * todo;
 */
export function actor_needs_bless(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  const actor: XR_game_object = registry.actor;

  return actor.health < 1 || actor.radiation > 0 || actor.bleeding > 0;
}

/**
 * todo;
 */
export function actor_is_damn_healthy(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): boolean {
  return !actor_needs_bless(firstSpeaker, secondSpeaker);
}

/**
 * todo;
 */
export function leave_zone_save(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_uni_zone_to_reality);
}

/**
 * todo;
 */
export function save_uni_travel_zat_to_jup(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_uni_travel_zat_to_jup);
}

/**
 * todo;
 */
export function save_uni_travel_zat_to_pri(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_uni_travel_zat_to_pri);
}

/**
 * todo;
 */
export function save_uni_travel_jup_to_zat(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_uni_travel_jup_to_zat);
}

/**
 * todo;
 */
export function save_uni_travel_jup_to_pri(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_uni_travel_jup_to_pri);
}

/**
 * todo;
 */
export function save_uni_travel_pri_to_zat(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_uni_travel_pri_to_zat);
}

/**
 * todo;
 */
export function save_uni_travel_pri_to_jup(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_uni_travel_pri_to_jup);
}

/**
 * todo;
 */
export function save_jup_b218_travel_jup_to_pas(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_jup_b218_travel_jup_to_pas);
}

/**
 * todo;
 */
export function save_pri_a17_hospital_start(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_pri_a17_hospital_start);
}

/**
 * todo;
 */
export function save_jup_a10_gonna_return_debt(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  if (!hasAlifeInfo(info_portions.jup_a10_avtosave)) {
    createAutoSave(captions.st_save_jup_a10_gonna_return_debt);
    giveInfo(info_portions.jup_a10_avtosave);
  }
}

/**
 * todo;
 */
export function save_jup_b6_arrived_to_fen(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_jup_b6_arrived_to_fen);
}

/**
 * todo;
 */
export function save_jup_b6_arrived_to_ash_heap(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_jup_b6_arrived_to_ash_heap);
}

/**
 * todo;
 */
export function save_jup_b19_arrived_to_kopachy(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  createAutoSave(captions.st_save_jup_b19_arrived_to_kopachy);
}

/**
 * todo;
 */
export function save_zat_b106_arrived_to_chimera_lair(
  firstSpeaker: XR_game_object,
  secondSpeaker: XR_game_object
): void {
  createAutoSave(captions.st_save_zat_b106_arrived_to_chimera_lair);
}

/**
 * todo;
 */
export function save_zat_b5_met_with_others(firstSpeaker: XR_game_object, secondSpeaker: XR_game_object): void {
  getExtern<AnyCallablesModule>("xr_effects").scenario_autosave(registry.actor, null, [
    "st_save_zat_b5_met_with_others",
  ]);
}
