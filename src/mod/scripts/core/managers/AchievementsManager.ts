import { captions } from "@/mod/globals/captions";
import { communities } from "@/mod/globals/communities";
import { info_portions, TInfoPortion } from "@/mod/globals/info_portions/info_portions";
import { AnyCallablesModule } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/db";
import { pstor_retrieve } from "@/mod/scripts/core/db/pstor";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { StatisticsManager } from "@/mod/scripts/core/managers/StatisticsManager";
import { send_tip } from "@/mod/scripts/core/NewsManager";
import { giveInfo, hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("AchievementsManager");

export enum EAchievement {
  PIONEER = "pioneer",
  MUTANT_HUNTER = "mutant_hunter",
  DETECTIVE = "detective",
  ONE_OF_THE_LADS = "one_of_the_lads",
  KINGPIN = "kingpin",
  HERALD_OF_JUSTICE = "herald_of_justice",
  SEEKER = "seeker",
  BATTLE_SYSTEMS_MASTER = "battle_systems_master",
  HIGH_TECH_MASTER = "high_tech_master",
  SKILLED_STALKER = "skilled_stalker",
  LEADER = "leader",
  DIPLOMAT = "diplomat",
  RESEARCH_MAN = "research_man",
  FRIEND_OF_DUTY = "friend_of_duty",
  FRIEND_OF_FREEDOM = "friend_of_freedom",
  BALANCE_ADVOCATE = "balance_advocate",
  WEALTHY = "wealthy",
  KEEPER_OF_SECRETS = "keeper_of_secrets",
  MARKED_BY_ZONE = "marked_by_zone",
  INFORMATION_DEALER = "information_dealer",
  FRIEND_OF_STALKERS = "friend_of_stalkers",
}

export class AchievementsManager extends AbstractCoreManager {
  public checkAchieved(achievement: EAchievement): boolean {
    switch (achievement) {
      case EAchievement.PIONEER:
        return this.checkAchievedPioneer();
      case EAchievement.MUTANT_HUNTER:
        return this.checkAchievedMutantHunter();
      case EAchievement.DETECTIVE:
        return this.checkAchievedDetective();
      case EAchievement.ONE_OF_THE_LADS:
        return this.checkAchievedOneOfLads();
      case EAchievement.KINGPIN:
        return this.checkAchievedKingpin();
      case EAchievement.HERALD_OF_JUSTICE:
        return this.checkAchievedKingpin();
      case EAchievement.SEEKER:
        return this.checkAchievedSeeker();
      case EAchievement.BATTLE_SYSTEMS_MASTER:
        return this.checkAchievedBattleSystemsMaster();
      case EAchievement.HIGH_TECH_MASTER:
        return this.checkAchievedHighTechMaster();
      case EAchievement.SKILLED_STALKER:
        return this.checkAchievedSkilledStalker();
      case EAchievement.LEADER:
        return this.checkAchievedLeader();
      case EAchievement.DIPLOMAT:
        return this.checkAchievedDiplomat();
      case EAchievement.RESEARCH_MAN:
        return this.checkAchievedResearchMan();
      case EAchievement.FRIEND_OF_DUTY:
        return this.checkAchievedFriendOfDuty();
      case EAchievement.FRIEND_OF_FREEDOM:
        return this.checkAchievedFriendOfFreedom();
      case EAchievement.BALANCE_ADVOCATE:
        return this.checkAchievedBalanceAdvocate();
      case EAchievement.WEALTHY:
        return this.checkAchievedWealthy();
      case EAchievement.KEEPER_OF_SECRETS:
        return this.checkAchievedKeeperOfSecrets();
      case EAchievement.MARKED_BY_ZONE:
        return this.checkAchievedMarkedByZone();
      case EAchievement.INFORMATION_DEALER:
        return this.checkAchievedInformationDealer();
      case EAchievement.FRIEND_OF_STALKERS:
        return this.checkAchievedFriendOfStalkers();
      default:
        return false;
    }
  }

  public checkAchievedPioneer(): boolean {
    if (!hasAlifeInfo(info_portions.pioneer_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.zat_b14_give_item_linker) &&
        hasAlifeInfo(info_portions.jup_b1_complete_end) &&
        hasAlifeInfo(info_portions.jup_b206_anomalous_grove_done)
      ) {
        giveInfo(info_portions.pioneer_achievement_gained);
        send_tip(registry.actor, captions.st_ach_pioneer, null, EAchievement.PIONEER, null, null);
      }
    }

    return hasAlifeInfo(info_portions.pioneer_achievement_gained);
  }

  public checkAchievedMutantHunter(): boolean {
    if (!hasAlifeInfo(info_portions.mutant_hunter_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_b208_burers_hunt_done) &&
        hasAlifeInfo(info_portions.jup_b211_scene_done) &&
        hasAlifeInfo(info_portions.jup_b212_jupiter_chimera_hunt_done)
      ) {
        giveInfo(info_portions.mutant_hunter_achievement_gained);
        send_tip(registry.actor, captions.st_ach_mutant_hunter, null, EAchievement.MUTANT_HUNTER, null, null);
      }
    }

    return hasAlifeInfo(info_portions.mutant_hunter_achievement_gained);
  }

  public checkAchievedDetective(): boolean {
    if (!hasAlifeInfo(info_portions.detective_achievement_gained)) {
      if (hasAlifeInfo(info_portions.zat_b22_barmen_gave_reward)) {
        registry.actor.give_info_portion(info_portions.detective_achievement_gained);
        send_tip(registry.actor, captions.st_ach_detective, null, EAchievement.DETECTIVE, null, null);
      }
    }

    return hasAlifeInfo(info_portions.detective_achievement_gained);
  }

  public checkAchievedOneOfLads(): boolean {
    if (!hasAlifeInfo(info_portions.one_of_the_lads_gained)) {
      if (hasAlifeInfo(info_portions.zat_b30_sultan_loose) && hasAlifeInfo(info_portions.zat_b7_actor_help_stalkers)) {
        registry.actor.give_info_portion(info_portions.one_of_the_lads_gained);
        send_tip(registry.actor, captions.st_ach_one_of_the_lads, null, EAchievement.ONE_OF_THE_LADS, null, null);
      }
    }

    return hasAlifeInfo(info_portions.one_of_the_lads_gained);
  }

  public checkAchievedKingpin(): boolean {
    if (!hasAlifeInfo(info_portions.kingpin_gained)) {
      if (
        hasAlifeInfo(info_portions.zat_b30_barmen_under_sultan) &&
        hasAlifeInfo(info_portions.zat_b7_actor_help_bandits)
      ) {
        registry.actor.give_info_portion(info_portions.kingpin_gained);
        send_tip(registry.actor, captions.st_ach_kingpin, null, EAchievement.KINGPIN, null, null);
      }
    }

    return hasAlifeInfo(info_portions.kingpin_gained);
  }

  public checkAchievedHeraldOfJustice(): boolean {
    if (!hasAlifeInfo(info_portions.herald_of_justice_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_duty) ||
        hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_freedom) ||
        hasAlifeInfo(info_portions.zat_b106_found_soroka_done)
      ) {
        registry.actor.give_info_portion(info_portions.herald_of_justice_achievement_gained);
        send_tip(registry.actor, captions.st_ach_herald_of_justice, null, EAchievement.HERALD_OF_JUSTICE, null, null);
      }
    }

    return hasAlifeInfo(info_portions.herald_of_justice_achievement_gained);
  }

  public checkAchievedSeeker(): boolean {
    if (hasAlifeInfo(info_portions.sim_bandit_attack_harder)) {
      return true;
    }

    for (const [k, v] of StatisticsManager.getInstance().artefacts_table) {
      if (!v) {
        return false;
      }
    }

    registry.actor.give_info_portion(info_portions.sim_bandit_attack_harder);

    send_tip(registry.actor, captions.st_ach_seeker, null, EAchievement.SEEKER, null, null);
    get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(registry.actor, null, [
      communities.stalker,
      200,
    ]);

    return true;
  }

  public checkAchievedBattleSystemsMaster(): boolean {
    if (!hasAlifeInfo(info_portions.battle_systems_master_achievement_gained)) {
      if (hasAlifeInfo(info_portions.zat_b3_all_instruments_brought)) {
        send_tip(
          registry.actor,
          captions.st_ach_battle_systems_master,
          null,
          EAchievement.BATTLE_SYSTEMS_MASTER,
          null,
          null
        );
        giveInfo(info_portions.battle_systems_master_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.battle_systems_master_achievement_gained);
  }

  public checkAchievedHighTechMaster(): boolean {
    if (!hasAlifeInfo(info_portions.high_tech_master_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_b217_tech_instrument_1_brought) &&
        hasAlifeInfo(info_portions.jup_b217_tech_instrument_2_brought) &&
        hasAlifeInfo(info_portions.jup_b217_tech_instrument_3_brought)
      ) {
        send_tip(registry.actor, captions.st_ach_high_tech_master, null, EAchievement.HIGH_TECH_MASTER, null, null);
        giveInfo(info_portions.high_tech_master_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.high_tech_master_achievement_gained);
  }

  public checkAchievedSkilledStalker(): boolean {
    if (!hasAlifeInfo(info_portions.skilled_stalker_achievement_gained)) {
      if (hasAlifeInfo(info_portions.actor_was_in_many_bad_places)) {
        send_tip(registry.actor, captions.st_ach_skilled_stalker, null, EAchievement.SKILLED_STALKER, null, null);
        giveInfo(info_portions.skilled_stalker_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.skilled_stalker_achievement_gained);
  }

  public checkAchievedLeader(): boolean {
    if (!hasAlifeInfo(info_portions.leader_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_a10_vano_agree_go_und) &&
        hasAlifeInfo(info_portions.jup_b218_soldier_hired) &&
        hasAlifeInfo(info_portions.jup_b218_monolith_hired)
      ) {
        send_tip(registry.actor, captions.st_ach_leader, null, EAchievement.LEADER, null, null);
        giveInfo(info_portions.leader_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.leader_achievement_gained);
  }

  public checkAchievedDiplomat(): boolean {
    if (!hasAlifeInfo(info_portions.diplomat_achievement_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_a12_wo_shooting) &&
        (hasAlifeInfo(info_portions.jup_a10_bandit_take_all_money) ||
          hasAlifeInfo(info_portions.jup_a10_bandit_take_money))
      ) {
        send_tip(registry.actor, captions.st_ach_diplomat, null, EAchievement.DIPLOMAT, null, null);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(registry.actor, null, [
          communities.stalker,
          200,
        ]);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(registry.actor, null, [
          communities.freedom,
          200,
        ]);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(registry.actor, null, [
          communities.dolg,
          200,
        ]);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(registry.actor, null, [
          communities.bandit,
          200,
        ]);
        giveInfo(info_portions.diplomat_achievement_gained);
      }
    }

    return hasAlifeInfo(info_portions.diplomat_achievement_gained);
  }

  public checkAchievedResearchMan(): boolean {
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
      [8]: info_portions.jup_b209_task_done,
    } as unknown as LuaTable<number, string>;

    let count = 0;

    for (const [k, v] of info_table) {
      if (hasAlifeInfo(v)) {
        count = count + 1;
      }

      if (count >= 4) {
        giveInfo(info_portions.research_man_gained);
        send_tip(registry.actor, captions.st_ach_research_man, null, EAchievement.RESEARCH_MAN, null, null);

        return true;
      }
    }

    return false;
  }

  public checkAchievedFriendOfDuty(): boolean {
    if (!hasAlifeInfo(info_portions.sim_duty_help_harder)) {
      if (
        hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_duty) &&
        hasAlifeInfo(info_portions.jup_b46_duty_founder_pda_to_duty) &&
        hasAlifeInfo(info_portions.jup_b207_sell_dealers_pda_duty) &&
        hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_duty)
      ) {
        giveInfo(info_portions.sim_duty_help_harder);
        send_tip(registry.actor, captions.st_ach_friend_of_duty, null, EAchievement.FRIEND_OF_DUTY, null, null);
      }
    }

    return hasAlifeInfo(info_portions.sim_duty_help_harder);
  }

  public checkAchievedFriendOfFreedom(): boolean {
    if (!hasAlifeInfo(info_portions.sim_freedom_help_harder)) {
      if (
        hasAlifeInfo(info_portions.jup_b4_monolith_squad_in_freedom) &&
        hasAlifeInfo(info_portions.jup_b46_duty_founder_pda_to_freedom) &&
        hasAlifeInfo(info_portions.jup_b207_sell_dealers_pda_freedom) &&
        hasAlifeInfo(info_portions.jup_b25_flint_blame_done_to_freedom)
      ) {
        giveInfo(info_portions.sim_freedom_help_harder);
        send_tip(registry.actor, captions.st_ach_friend_of_freedom, null, EAchievement.FRIEND_OF_FREEDOM, null, null);
      }
    }

    return hasAlifeInfo(info_portions.sim_freedom_help_harder);
  }

  public checkAchievedBalanceAdvocate(): boolean {
    if (!hasAlifeInfo(info_portions.balance_advocate_gained)) {
      if (
        hasAlifeInfo(info_portions.jup_b46_duty_founder_pda_to_owl) &&
        hasAlifeInfo(info_portions.jup_b207_dealers_pda_sold_owl) &&
        hasAlifeInfo(info_portions.zat_b106_found_soroka_done)
      ) {
        giveInfo(info_portions.balance_advocate_gained);
        send_tip(registry.actor, captions.st_ach_balance_advocate, null, EAchievement.BALANCE_ADVOCATE, null, null);
      }
    }

    return hasAlifeInfo(info_portions.balance_advocate_gained);
  }

  public checkAchievedWealthy(): boolean {
    if (registry.actor.money() >= 100_000 && !hasAlifeInfo(info_portions.actor_wealthy)) {
      giveInfo(info_portions.actor_wealthy);
      send_tip(registry.actor, captions.st_ach_wealthy, null, EAchievement.WEALTHY, null, null);
    }

    return hasAlifeInfo(info_portions.actor_wealthy);
  }

  public checkAchievedKeeperOfSecrets(): boolean {
    if (!hasAlifeInfo(info_portions.keeper_of_secrets_achievement_gained)) {
      if (hasAlifeInfo(info_portions.pri_b305_all_strelok_notes_given)) {
        giveInfo(info_portions.keeper_of_secrets_achievement_gained);
        send_tip(registry.actor, captions.st_ach_keeper_of_secrets, null, EAchievement.KEEPER_OF_SECRETS, null, null);
      }
    }

    return hasAlifeInfo(info_portions.keeper_of_secrets_achievement_gained);
  }

  public checkAchievedMarkedByZone(): boolean {
    if (hasAlifeInfo(info_portions.actor_marked_by_zone_3_times)) {
      return true;
    }

    const cnt_value = pstor_retrieve(registry.actor, "actor_marked_by_zone_cnt", 0);

    if (cnt_value > 2) {
      giveInfo(info_portions.actor_marked_by_zone_3_times);
      send_tip(registry.actor, captions.st_ach_marked_by_zone, null, EAchievement.MARKED_BY_ZONE, null, null);

      return true;
    }

    return false;
  }

  public checkAchievedInformationDealer(): boolean {
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
      [16]: "jup_b10_ufo_memory_2_sold",
    } as unknown as LuaTable<number, TInfoPortion>;

    let count: number = 0;

    for (const [k, v] of info_table) {
      if (hasAlifeInfo(v)) {
        count = count + 1;
      }

      if (count >= 10) {
        send_tip(registry.actor, captions.st_ach_information_dealer, null, EAchievement.INFORMATION_DEALER, null, null);
        giveInfo(info_portions.actor_information_dealer);
      }
    }

    return hasAlifeInfo(info_portions.actor_information_dealer);
  }

  public checkAchievedFriendOfStalkers(): boolean {
    if (!hasAlifeInfo(info_portions.sim_stalker_help_harder)) {
      if (
        hasAlifeInfo(info_portions.jup_b220_trapper_zaton_chimera_hunted_told) &&
        hasAlifeInfo(info_portions.jup_a12_stalker_prisoner_helped) &&
        hasAlifeInfo(info_portions.jup_a10_vano_give_task_end) &&
        hasAlifeInfo(info_portions.zat_b5_stalker_leader_end) &&
        hasAlifeInfo(info_portions.zat_b7_task_end)
      ) {
        giveInfo(info_portions.sim_stalker_help_harder);
        send_tip(registry.actor, captions.st_ach_friend_of_stalkers, null, EAchievement.FRIEND_OF_STALKERS, null, null);
        get_global<AnyCallablesModule>("xr_effects").inc_faction_goodwill_to_actor(registry.actor, null, [
          communities.stalker,
          100,
        ]);
      }
    }

    return hasAlifeInfo(info_portions.sim_stalker_help_harder);
  }
}
