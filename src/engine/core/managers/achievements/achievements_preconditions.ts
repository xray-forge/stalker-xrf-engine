import { registry } from "@/engine/core/database";
import { achievementIcons } from "@/engine/core/managers/achievements/achievements_icons";
import { achievementRewards } from "@/engine/core/managers/achievements/achievements_rewards";
import { EAchievement } from "@/engine/core/managers/achievements/achievements_types";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationType, ITipNotification } from "@/engine/core/managers/notifications";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { giveInfoPortion, hasFewInfoPortions, hasInfoPortion, hasInfoPortions } from "@/engine/core/utils/info_portion";
import { increaseCommunityGoodwillToId } from "@/engine/core/utils/relation";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { TNumberId } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function hasAchievedPioneer(): boolean {
  if (!hasInfoPortion(infoPortions.pioneer_achievement_gained)) {
    if (
      hasInfoPortions([
        infoPortions.zat_b14_give_item_linker,
        infoPortions.jup_b1_complete_end,
        infoPortions.jup_b206_anomalous_grove_done,
      ])
    ) {
      giveInfoPortion(infoPortions.pioneer_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_pioneer",
        senderId: achievementIcons[EAchievement.PIONEER],
      });
    }
  }

  return hasInfoPortion(infoPortions.pioneer_achievement_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedMutantHunter(): boolean {
  if (!hasInfoPortion(infoPortions.mutant_hunter_achievement_gained)) {
    if (
      hasInfoPortions([
        infoPortions.jup_b208_burers_hunt_done,
        infoPortions.jup_b211_scene_done,
        infoPortions.jup_b212_jupiter_chimera_hunt_done,
      ])
    ) {
      giveInfoPortion(infoPortions.mutant_hunter_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_mutant_hunter",
        senderId: achievementIcons[EAchievement.MUTANT_HUNTER],
      });
    }
  }

  return hasInfoPortion(infoPortions.mutant_hunter_achievement_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedDetective(): boolean {
  if (!hasInfoPortion(infoPortions.detective_achievement_gained)) {
    if (hasInfoPortion(infoPortions.zat_b22_barmen_gave_reward)) {
      giveInfoPortion(infoPortions.detective_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_detective",
        senderId: achievementIcons[EAchievement.DETECTIVE],
      });
    }
  }

  return hasInfoPortion(infoPortions.detective_achievement_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedOneOfLads(): boolean {
  if (!hasInfoPortion(infoPortions.one_of_the_lads_gained)) {
    if (hasInfoPortions([infoPortions.zat_b30_sultan_loose, infoPortions.zat_b7_actor_help_stalkers])) {
      giveInfoPortion(infoPortions.one_of_the_lads_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_one_of_the_lads",
        senderId: achievementIcons[EAchievement.ONE_OF_THE_LADS],
      });
    }
  }

  return hasInfoPortion(infoPortions.one_of_the_lads_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedKingpin(): boolean {
  if (!hasInfoPortion(infoPortions.kingpin_gained)) {
    if (hasInfoPortions([infoPortions.zat_b30_barmen_under_sultan, infoPortions.zat_b7_actor_help_bandits])) {
      giveInfoPortion(infoPortions.kingpin_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_kingpin",
        senderId: achievementIcons[EAchievement.KINGPIN],
      });
    }
  }

  return hasInfoPortion(infoPortions.kingpin_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedHeraldOfJustice(): boolean {
  if (!hasInfoPortion(infoPortions.herald_of_justice_achievement_gained)) {
    if (
      hasInfoPortions([
        infoPortions.jup_b25_flint_blame_done_to_duty,
        infoPortions.jup_b25_flint_blame_done_to_freedom,
        infoPortions.zat_b106_found_soroka_done,
      ])
    ) {
      giveInfoPortion(infoPortions.herald_of_justice_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_herald_of_justice",
        senderId: achievementIcons[EAchievement.HERALD_OF_JUSTICE],
      });
    }
  }

  return hasInfoPortion(infoPortions.herald_of_justice_achievement_gained);
}

/**
 * Check whether actor achieved seeker achievement.
 * It is given as reward for collecting all unique game artefacts.
 * By default, in COP there are 22 unique artefact sections.
 */
export function hasAchievedSeeker(): boolean {
  if (hasInfoPortion(infoPortions.sim_bandit_attack_harder)) {
    return true;
  }

  // Require unique artefacts count to be found for seeker achievement.
  if (
    StatisticsManager.getInstance().actorStatistics.collectedArtefacts.length() <
    achievementRewards.ARTEFACTS_SEEKER_UNIQUES_REQUIRED
  ) {
    return false;
  }

  giveInfoPortion(infoPortions.sim_bandit_attack_harder);
  increaseCommunityGoodwillToId(communities.stalker, registry.actor.id(), 200);

  EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.TIP,
    caption: "st_ach_seeker",
    senderId: achievementIcons[EAchievement.SEEKER],
  });

  return true;
}

/**
 * todo: Description.
 */
export function hasAchievedBattleSystemsMaster(): boolean {
  if (!hasInfoPortion(infoPortions.battle_systems_master_achievement_gained)) {
    if (hasInfoPortion(infoPortions.zat_b3_all_instruments_brought)) {
      giveInfoPortion(infoPortions.battle_systems_master_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_battle_systems_master",
        senderId: achievementIcons[EAchievement.BATTLE_SYSTEMS_MASTER],
      });
    }
  }

  return hasInfoPortion(infoPortions.battle_systems_master_achievement_gained);
}

/**
 * Check whether high-tech master achievement is completed.
 */
export function hasAchievedHighTechMaster(): boolean {
  if (!hasInfoPortion(infoPortions.high_tech_master_achievement_gained)) {
    if (
      hasInfoPortions([
        infoPortions.jup_b217_tech_instrument_1_brought,
        infoPortions.jup_b217_tech_instrument_2_brought,
        infoPortions.jup_b217_tech_instrument_3_brought,
      ])
    ) {
      giveInfoPortion(infoPortions.high_tech_master_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_high_tech_master",
        senderId: achievementIcons[EAchievement.HIGH_TECH_MASTER],
      });
    }
  }

  return hasInfoPortion(infoPortions.high_tech_master_achievement_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedSkilledStalker(): boolean {
  if (!hasInfoPortion(infoPortions.skilled_stalker_achievement_gained)) {
    if (hasInfoPortion(infoPortions.actor_was_in_many_bad_places)) {
      giveInfoPortion(infoPortions.skilled_stalker_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_skilled_stalker",
        senderId: achievementIcons[EAchievement.SKILLED_STALKER],
      });
    }
  }

  return hasInfoPortion(infoPortions.skilled_stalker_achievement_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedLeader(): boolean {
  if (!hasInfoPortion(infoPortions.leader_achievement_gained)) {
    if (
      hasInfoPortions([
        infoPortions.jup_a10_vano_agree_go_und,
        infoPortions.jup_b218_soldier_hired,
        infoPortions.jup_b218_monolith_hired,
      ])
    ) {
      giveInfoPortion(infoPortions.leader_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_leader",
        senderId: achievementIcons[EAchievement.LEADER],
      });
    }
  }

  return hasInfoPortion(infoPortions.leader_achievement_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedDiplomat(): boolean {
  if (!hasInfoPortion(infoPortions.diplomat_achievement_gained)) {
    if (
      hasFewInfoPortions(
        [
          infoPortions.jup_a12_wo_shooting,
          infoPortions.jup_a10_bandit_take_all_money,
          infoPortions.jup_a10_bandit_take_money,
        ],
        2
      )
    ) {
      giveInfoPortion(infoPortions.diplomat_achievement_gained);

      const actorId: TNumberId = registry.actor.id();

      increaseCommunityGoodwillToId(communities.stalker, actorId, 200);
      increaseCommunityGoodwillToId(communities.freedom, actorId, 200);
      increaseCommunityGoodwillToId(communities.dolg, actorId, 200);
      increaseCommunityGoodwillToId(communities.bandit, actorId, 200);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_diplomat",
        senderId: achievementIcons[EAchievement.DIPLOMAT],
      });
    }
  }

  return hasInfoPortion(infoPortions.diplomat_achievement_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedResearchMan(): boolean {
  if (!hasInfoPortion(infoPortions.research_man_gained)) {
    if (
      hasFewInfoPortions(
        [
          infoPortions.jup_b16_task_done,
          infoPortions.jup_b1_task_done,
          infoPortions.jup_b46_task_done,
          infoPortions.jup_b47_task_end,
          infoPortions.jup_b32_task_done,
          infoPortions.jup_b6_task_done,
          infoPortions.jup_b206_task_done,
          infoPortions.jup_b209_task_done,
        ],
        4
      )
    ) {
      giveInfoPortion(infoPortions.research_man_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_research_man",
        senderId: achievementIcons[EAchievement.RESEARCH_MAN],
      });
    }
  }

  return hasInfoPortion(infoPortions.research_man_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedFriendOfDuty(): boolean {
  if (!hasInfoPortion(infoPortions.sim_duty_help_harder)) {
    if (
      hasInfoPortions([
        infoPortions.jup_b4_monolith_squad_in_duty,
        infoPortions.jup_b46_duty_founder_pda_to_duty,
        infoPortions.jup_b207_sell_dealers_pda_duty,
        infoPortions.jup_b25_flint_blame_done_to_duty,
      ])
    ) {
      giveInfoPortion(infoPortions.sim_duty_help_harder);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_friend_of_duty",
        senderId: achievementIcons[EAchievement.FRIEND_OF_DUTY],
      });
    }
  }

  return hasInfoPortion(infoPortions.sim_duty_help_harder);
}

/**
 * todo: Description.
 */
export function hasAchievedFriendOfFreedom(): boolean {
  if (!hasInfoPortion(infoPortions.sim_freedom_help_harder)) {
    if (
      hasInfoPortions([
        infoPortions.jup_b4_monolith_squad_in_freedom,
        infoPortions.jup_b46_duty_founder_pda_to_freedom,
        infoPortions.jup_b207_sell_dealers_pda_freedom,
        infoPortions.jup_b25_flint_blame_done_to_freedom,
      ])
    ) {
      giveInfoPortion(infoPortions.sim_freedom_help_harder);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_friend_of_freedom",
        senderId: achievementIcons[EAchievement.FRIEND_OF_FREEDOM],
      });
    }
  }

  return hasInfoPortion(infoPortions.sim_freedom_help_harder);
}

/**
 * todo: Description.
 */
export function hasAchievedBalanceAdvocate(): boolean {
  if (!hasInfoPortion(infoPortions.balance_advocate_gained)) {
    if (
      hasInfoPortions([
        infoPortions.jup_b46_duty_founder_pda_to_owl,
        infoPortions.jup_b207_dealers_pda_sold_owl,
        infoPortions.zat_b106_found_soroka_done,
      ])
    ) {
      giveInfoPortion(infoPortions.balance_advocate_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_balance_advocate",
        senderId: achievementIcons[EAchievement.BALANCE_ADVOCATE],
      });
    }
  }

  return hasInfoPortion(infoPortions.balance_advocate_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedWealthy(): boolean {
  if (!hasInfoPortion(infoPortions.actor_wealthy) && registry.actor.money() >= 100_000) {
    giveInfoPortion(infoPortions.actor_wealthy);

    EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TIP,
      caption: "st_ach_wealthy",
      senderId: achievementIcons[EAchievement.WEALTHY],
    });
  }

  return hasInfoPortion(infoPortions.actor_wealthy);
}

/**
 * todo: Description.
 */
export function hasAchievedKeeperOfSecrets(): boolean {
  if (!hasInfoPortion(infoPortions.keeper_of_secrets_achievement_gained)) {
    if (hasInfoPortion(infoPortions.pri_b305_all_strelok_notes_given)) {
      giveInfoPortion(infoPortions.keeper_of_secrets_achievement_gained);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_keeper_of_secrets",
        senderId: achievementIcons[EAchievement.KEEPER_OF_SECRETS],
      });
    }
  }

  return hasInfoPortion(infoPortions.keeper_of_secrets_achievement_gained);
}

/**
 * todo: Description.
 */
export function hasAchievedMarkedByZone(): boolean {
  if (hasInfoPortion(infoPortions.actor_marked_by_zone_3_times)) {
    return true;
  }

  if (StatisticsManager.getInstance().getUsedAnabioticsCount() >= 3) {
    giveInfoPortion(infoPortions.actor_marked_by_zone_3_times);

    EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TIP,
      caption: "st_ach_marked_by_zone",
      senderId: achievementIcons[EAchievement.MARKED_BY_ZONE],
    });

    return true;
  }

  return false;
}

/**
 * todo: Description.
 */
export function hasAchievedInformationDealer(): boolean {
  if (!hasInfoPortion(infoPortions.actor_information_dealer)) {
    if (
      hasFewInfoPortions(
        [
          infoPortions.zat_b40_pda_1_saled,
          infoPortions.zat_b40_pda_2_saled,
          infoPortions.jup_b46_duty_founder_pda_sold,
          infoPortions.jup_b207_merc_pda_with_contract_sold,
          infoPortions.jup_b207_dealers_pda_sold,
          infoPortions.jup_a9_evacuation_info_sold,
          infoPortions.jup_a9_meeting_info_sold,
          infoPortions.jup_a9_losses_info_sold,
          infoPortions.jup_a9_delivery_info_sold,
          infoPortions.zat_b12_documents_sold_1,
          infoPortions.zat_b12_documents_sold_2,
          infoPortions.zat_b12_documents_sold_3,
          infoPortions.zat_b40_notebook_saled,
          infoPortions.device_flash_snag_sold,
          infoPortions.device_pda_port_bandit_leader_sold,
          infoPortions.jup_b10_ufo_memory_2_sold,
        ],
        10
      )
    ) {
      giveInfoPortion(infoPortions.actor_information_dealer);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_information_dealer",
        senderId: achievementIcons[EAchievement.INFORMATION_DEALER],
      });
    }
  }

  return hasInfoPortion(infoPortions.actor_information_dealer);
}

/**
 * todo: Description.
 */
export function hasAchievedFriendOfStalkers(): boolean {
  if (!hasInfoPortion(infoPortions.sim_stalker_help_harder)) {
    if (
      hasInfoPortions([
        infoPortions.jup_b220_trapper_zaton_chimera_hunted_told,
        infoPortions.jup_a12_stalker_prisoner_helped,
        infoPortions.jup_a10_vano_give_task_end,
        infoPortions.zat_b5_stalker_leader_end,
        infoPortions.zat_b7_task_end,
      ])
    ) {
      giveInfoPortion(infoPortions.sim_stalker_help_harder);
      increaseCommunityGoodwillToId(communities.stalker, registry.actor.id(), 100);

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_ach_friend_of_stalkers",
        senderId: achievementIcons[EAchievement.FRIEND_OF_STALKERS],
      });
    }
  }

  return hasInfoPortion(infoPortions.sim_stalker_help_harder);
}
