import { captions } from "@/mod/globals/captions";
import { communities } from "@/mod/globals/communities";
import { info_portions, TInfoPortion } from "@/mod/globals/info_portions";
import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { StatisticsManager } from "@/mod/scripts/core/managers/StatisticsManager";
import { send_tip } from "@/mod/scripts/core/NewsManager";
import { giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/actor";

export class AchievementsManager extends AbstractCoreManager {
  public checkAchievedPioneer(): boolean {
    if (!hasAlifeInfo(info_portions.pioneer_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.zat_b14_give_item_linker) &&
        hasAlifeInfo(info_portions.jup_b1_complete_end) &&
        hasAlifeInfo(info_portions.jup_b206_anomalous_grove_done)
      ) {
        giveInfo(info_portions.pioneer_achievement_gained);
        send_tip(getActor()!, captions.st_ach_pioneer, null, "pioneer", null, null);
      }
    }

    return hasAlifeInfo(info_portions.pioneer_achievement_gained);
  }

  public achievedMutantHunter(): boolean {
    if (!hasAlifeInfo(info_portions.mutant_hunter_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_b208_burers_hunt_done) &&
        hasAlifeInfo(info_portions.jup_b211_scene_done) &&
        hasAlifeInfo(info_portions.jup_b212_jupiter_chimera_hunt_done)
      ) {
        giveInfo(info_portions.mutant_hunter_achievement_gained);
        send_tip(getActor()!, captions.st_ach_mutant_hunter, null, "mutant_hunter", null, null);
      }
    }

    return hasAlifeInfo(info_portions.mutant_hunter_achievement_gained);
  }

  public achievedDetective(): boolean {
    if (!hasAlifeInfo(info_portions.detective_achievement_gained)) {
      if (hasAlifeInfo(info_portions.zat_b22_barmen_gave_reward)) {
        getActor()!.give_info_portion(info_portions.detective_achievement_gained);
        send_tip(getActor()!, captions.st_ach_detective, null, "detective", null, null);
      }
    }

    return hasAlifeInfo(info_portions.detective_achievement_gained);
  }

  public achievedOneOfLads(): boolean {
    if (!hasAlifeInfo(info_portions.one_of_the_lads_gained)) {
      if (hasAlifeInfo(info_portions.zat_b30_sultan_loose) && hasAlifeInfo(info_portions.zat_b7_actor_help_stalkers)) {
        getActor()!.give_info_portion(info_portions.one_of_the_lads_gained);
        send_tip(getActor()!, captions.st_ach_one_of_the_lads, null, "one_of_the_lads", null, null);
      }
    }

    return hasAlifeInfo(info_portions.one_of_the_lads_gained);
  }

  public achievedKingpin(): boolean {
    if (!hasAlifeInfo(info_portions.kingpin_gained)) {
      if (
        hasAlifeInfo(info_portions.zat_b30_barmen_under_sultan) &&
        hasAlifeInfo(info_portions.zat_b7_actor_help_bandits)
      ) {
        getActor()!.give_info_portion(info_portions.kingpin_gained);
        send_tip(getActor()!, captions.st_ach_kingpin, null, "kingpin", null, null);
      }
    }

    return hasAlifeInfo(info_portions.kingpin_gained);
  }

  public achievedHeraldOfJustice(): boolean {
    if (!hasAlifeInfo(info_portions.herald_of_justice_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_duty) ||
        hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_freedom) ||
        hasAlifeInfo(info_portions.zat_b106_found_soroka_done)
      ) {
        getActor()!.give_info_portion(info_portions.herald_of_justice_achievement_gained);
        send_tip(getActor()!, captions.st_ach_herald_of_justice, null, "herald_of_justice", null, null);
      }
    }

    return hasAlifeInfo(info_portions.herald_of_justice_achievement_gained);
  }

  public achievedSeeker(): boolean {
    if (hasAlifeInfo(info_portions.sim_bandit_attack_harder)) {
      return true;
    }

    for (const [k, v] of StatisticsManager.getInstance().artefacts_table) {
      if (!v) {
        return false;
      }
    }

    getActor()!.give_info_portion(info_portions.sim_bandit_attack_harder);

    send_tip(getActor()!, captions.st_ach_seeker, null, "seeker", null, null);
    get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(getActor(), null, [
      communities.stalker,
      200
    ]);

    return true;
  }

  public achievedBattleSystemsMaster(): boolean {
    if (!hasAlifeInfo(info_portions.battle_systems_master_achievement_gained)) {
      if (hasAlifeInfo(info_portions.zat_b3_all_instruments_brought)) {
        send_tip(getActor()!, captions.st_ach_battle_systems_master, null, "battle_systems_master", null, null);
        giveInfo(info_portions.battle_systems_master_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.battle_systems_master_achievement_gained);
  }

  public achievedHighTechMaster(): boolean {
    if (!hasAlifeInfo(info_portions.high_tech_master_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_b217_tech_instrument_1_brought) &&
        hasAlifeInfo(info_portions.jup_b217_tech_instrument_2_brought) &&
        hasAlifeInfo(info_portions.jup_b217_tech_instrument_3_brought)
      ) {
        send_tip(getActor()!, captions.st_ach_high_tech_master, null, "high_tech_master", null, null);
        giveInfo(info_portions.high_tech_master_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.high_tech_master_achievement_gained);
  }

  public achievedSkilledStalker(): boolean {
    if (!hasAlifeInfo(info_portions.skilled_stalker_achievement_gained)) {
      if (hasAlifeInfo(info_portions.actor_was_in_many_bad_places)) {
        send_tip(getActor()!, captions.st_ach_skilled_stalker, null, "skilled_stalker", null, null);
        giveInfo(info_portions.skilled_stalker_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.skilled_stalker_achievement_gained);
  }

  public achievedLeader(): boolean {
    if (!hasAlifeInfo(info_portions.leader_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_a10_vano_agree_go_und) &&
        hasAlifeInfo(info_portions.jup_b218_soldier_hired) &&
        hasAlifeInfo(info_portions.jup_b218_monolith_hired)
      ) {
        send_tip(getActor()!, captions.st_ach_leader, null, "leader", null, null);
        giveInfo(info_portions.leader_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.leader_achievement_gained);
  }

  public achievedDiplomat(): boolean {
    if (!hasAlifeInfo(info_portions.diplomat_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_a12_wo_shooting) &&
        (hasAlifeInfo(info_portions.jup_a10_bandit_take_all_money) ||
          hasAlifeInfo(info_portions.jup_a10_bandit_take_money))
      ) {
        send_tip(getActor()!, captions.st_ach_diplomat, null, "diplomat", null, null);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(getActor(), null, ["stalker", 200]);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(getActor(), null, ["freedom", 200]);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(getActor(), null, ["dolg", 200]);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(getActor(), null, ["bandit", 200]);
        giveInfo(info_portions.diplomat_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.diplomat_achievement_gained);
  }

  public achievedResearchMan(): boolean {
    if (hasAlifeInfo(info_portions.research_man_gained)) {
      return true;
    }

    const info_table = {
      [1]: info_portions.jup_b16_task_done,
      [2]: info_portions.jup_b1_task_done,
      [3]: info_portions.jup_b46_task_done,
      [4]: info_portions.jup_b47_task_end,
      [5]: info_portions.jup_b32_task_done,
      [6]: info_portions.jup_b6_task_done,
      [7]: info_portions.jup_b206_task_done,
      [8]: info_portions.jup_b209_task_done
    } as unknown as LuaTable<number, string>;

    let count = 0;

    for (const [k, v] of info_table) {
      if (hasAlifeInfo(v)) {
        count = count + 1;
      }

      if (count >= 4) {
        giveInfo(info_portions.research_man_gained);
        send_tip(getActor()!, captions.st_ach_research_man, null, "research_man", null, null);

        return true;
      }
    }

    return false;
  }

  public achievedFriendOfDuty(): boolean {
    if (!hasAlifeInfo(info_portions.sim_duty_help_harder)) {
      if (
        hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty) &&
        hasAlifeInfo(info_portions.jup_b46_duty_founder_pda_to_duty) &&
        hasAlifeInfo(info_portions.jup_b207_sell_dealers_pda_duty) &&
        hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_duty)
      ) {
        giveInfo(info_portions.sim_duty_help_harder);
        send_tip(getActor()!, captions.st_ach_friend_of_duty, null, "friend_of_duty", null, null);
      }
    }

    return hasAlifeInfo(info_portions.sim_duty_help_harder);
  }

  public achievedFriendOfFreedom(): boolean {
    if (!hasAlifeInfo(info_portions.sim_freedom_help_harder)) {
      if (
        hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom) &&
        hasAlifeInfo(info_portions.jup_b46_duty_founder_pda_to_freedom) &&
        hasAlifeInfo(info_portions.jup_b207_sell_dealers_pda_freedom) &&
        hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_freedom)
      ) {
        giveInfo(info_portions.sim_freedom_help_harder);
        send_tip(getActor()!, captions.st_ach_friend_of_freedom, null, "friend_of_freedom", null, null);
      }
    }

    return hasAlifeInfo(info_portions.sim_freedom_help_harder);
  }

  public achievedBalanceAdvocate(): boolean {
    if (!hasAlifeInfo(info_portions.balance_advocate_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_b46_duty_founder_pda_to_owl) &&
        hasAlifeInfo(info_portions.jup_b207_dealers_pda_sold_owl) &&
        hasAlifeInfo(info_portions.zat_b106_found_soroka_done)
      ) {
        giveInfo(info_portions.balance_advocate_gained);
        send_tip(getActor()!, captions.st_ach_balance_advocate, null, "balance_advocate", null, null);
      }
    }

    return hasAlifeInfo(info_portions.balance_advocate_gained);
  }

  public achievedWealth(): boolean {
    if (getActor()!.money() >= 100_000 && !hasAlifeInfo(info_portions.actor_wealthy)) {
      giveInfo(info_portions.actor_wealthy);
      send_tip(getActor()!, captions.st_ach_wealthy, null, "wealthy", null, null);
    }

    return hasAlifeInfo(info_portions.actor_wealthy);
  }

  public achievedKeeperOfSecrets(): boolean {
    if (!hasAlifeInfo(info_portions.keeper_of_secrets_achievement_gained)) {
      if (hasAlifeInfo(info_portions.pri_b305_all_strelok_notes_given)) {
        giveInfo(info_portions.keeper_of_secrets_achievement_gained);
        send_tip(getActor()!, captions.st_ach_keeper_of_secrets, null, "keeper_of_secrets", null, null);
      }
    }

    return hasAlifeInfo(info_portions.keeper_of_secrets_achievement_gained);
  }

  public achievedMarkedByZone(): boolean {
    if (hasAlifeInfo(info_portions.actor_marked_by_zone_3_times)) {
      return true;
    }

    const cnt_value = get_global<AnyCallablesModule>("xr_logic").pstor_retrieve(
      getActor(),
      "actor_marked_by_zone_cnt",
      0
    );

    if (cnt_value > 2) {
      giveInfo(info_portions.actor_marked_by_zone_3_times);
      send_tip(getActor()!, captions.st_ach_marked_by_zone, null, "marked_by_zone", null, null);

      return true;
    }

    return false;
  }

  public achievedInformationDealer(): boolean {
    if (hasAlifeInfo(info_portions.actor_information_dealer)) {
      return true;
    }

    const info_table = {
      [1]: "zat_b40_pda_1_saled",
      [2]: "zat_b40_pda_2_saled",
      [3]: "jup_b46_duty_founder_pda_sold",
      [4]: "jup_b207_merc_pda_with_contract_sold",
      [5]: "jup_b207_dealers_pda_sold",
      [6]: "jup_a9_evacuation_info_sold",
      [7]: "jup_a9_meeting_info_sold",
      [8]: "jup_a9_losses_info_sold",
      [9]: "jup_a9_delivery_info_sold",
      [10]: "zat_b12_documents_sold_1",
      [11]: "zat_b12_documents_sold_2",
      [12]: "zat_b12_documents_sold_3",
      [13]: "zat_b40_notebook_saled",
      [14]: "device_flash_snag_sold",
      [15]: "device_pda_port_bandit_leader_sold",
      [16]: "jup_b10_ufo_memory_2_sold"
    } as unknown as LuaTable<number, TInfoPortion>;

    let count: number = 0;

    for (const [k, v] of info_table) {
      if (hasAlifeInfo(v)) {
        count = count + 1;
      }

      if (count >= 10) {
        send_tip(getActor()!, captions.st_ach_information_dealer, null, "information_dealer", null, null);
        giveInfo(info_portions.actor_information_dealer);
      }
    }

    return hasAlifeInfo(info_portions.actor_information_dealer);
  }

  public achievedFriendOfStalkers(): boolean {
    if (!hasAlifeInfo(info_portions.sim_stalker_help_harder)) {
      if (
        hasAlifeInfo(info_portions.jup_b220_trapper_zaton_chimera_hunted_told) &&
        hasAlifeInfo(info_portions.jup_a12_stalker_prisoner_helped) &&
        hasAlifeInfo(info_portions.jup_a10_vano_give_task_end) &&
        hasAlifeInfo(info_portions.zat_b5_stalker_leader_end) &&
        hasAlifeInfo(info_portions.zat_b7_task_end)
      ) {
        giveInfo(info_portions.sim_stalker_help_harder);
        send_tip(getActor()!, captions.st_ach_friend_of_stalkers, null, "friend_of_stalkers", null, null);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(getActor(), null, [
          communities.stalker,
          100
        ]);
      }
    }

    return hasAlifeInfo(info_portions.sim_stalker_help_harder);
  }
}
