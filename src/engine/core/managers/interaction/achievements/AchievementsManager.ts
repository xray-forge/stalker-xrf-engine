import { alife, game, TXR_net_processor, XR_CTime, XR_net_packet } from "xray16";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { achievementIcons } from "@/engine/core/managers/interaction/achievements/AchievementIcons";
import { achievementRewards } from "@/engine/core/managers/interaction/achievements/AchievementRewards";
import { EAchievement } from "@/engine/core/managers/interaction/achievements/types";
import {
  ENotificationType,
  ITipNotification,
  notificationManagerIcons,
} from "@/engine/core/managers/interface/notifications";
import { StatisticsManager } from "@/engine/core/managers/interface/StatisticsManager";
import { giveInfo, hasAlifeInfo, hasAlifeInfos, hasFewAlifeInfos } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { increaseNumberRelationBetweenCommunityAndId } from "@/engine/core/utils/relation";
import { spawnItemsForObjectFromList } from "@/engine/core/utils/spawn";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { captions } from "@/engine/lib/constants/captions/captions";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions/info_portions";
import { Optional, TDuration, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: move to config file generic achievements descriptions
 */
export class AchievementsManager extends AbstractCoreManager {
  public lastDetectiveAchievementSpawnTime: Optional<XR_CTime> = null;
  public lastMutantHunterAchievementSpawnTime: Optional<XR_CTime> = null;

  /**
   * todo: Description.
   */
  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
  }

  /**
   * todo: Description.
   */
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
        return this.checkAchievedHeraldOfJustice();
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

  /**
   * todo: Description.
   */
  public checkAchievedPioneer(): boolean {
    if (!hasAlifeInfo(infoPortions.pioneer_achievement_gained)) {
      if (
        hasAlifeInfos([
          infoPortions.zat_b14_give_item_linker,
          infoPortions.jup_b1_complete_end,
          infoPortions.jup_b206_anomalous_grove_done,
        ])
      ) {
        giveInfo(infoPortions.pioneer_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_pioneer,
          senderId: achievementIcons[EAchievement.PIONEER],
        });
      }
    }

    return hasAlifeInfo(infoPortions.pioneer_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedMutantHunter(): boolean {
    if (!hasAlifeInfo(infoPortions.mutant_hunter_achievement_gained)) {
      if (
        hasAlifeInfos([
          infoPortions.jup_b208_burers_hunt_done,
          infoPortions.jup_b211_scene_done,
          infoPortions.jup_b212_jupiter_chimera_hunt_done,
        ])
      ) {
        giveInfo(infoPortions.mutant_hunter_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_mutant_hunter,
          senderId: achievementIcons[EAchievement.MUTANT_HUNTER],
        });
      }
    }

    return hasAlifeInfo(infoPortions.mutant_hunter_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedDetective(): boolean {
    if (!hasAlifeInfo(infoPortions.detective_achievement_gained)) {
      if (hasAlifeInfo(infoPortions.zat_b22_barmen_gave_reward)) {
        giveInfo(infoPortions.detective_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_detective,
          senderId: achievementIcons[EAchievement.DETECTIVE],
        });
      }
    }

    return hasAlifeInfo(infoPortions.detective_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedOneOfLads(): boolean {
    if (!hasAlifeInfo(infoPortions.one_of_the_lads_gained)) {
      if (hasAlifeInfos([infoPortions.zat_b30_sultan_loose, infoPortions.zat_b7_actor_help_stalkers])) {
        giveInfo(infoPortions.one_of_the_lads_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_one_of_the_lads,
          senderId: achievementIcons[EAchievement.ONE_OF_THE_LADS],
        });
      }
    }

    return hasAlifeInfo(infoPortions.one_of_the_lads_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedKingpin(): boolean {
    if (!hasAlifeInfo(infoPortions.kingpin_gained)) {
      if (hasAlifeInfos([infoPortions.zat_b30_barmen_under_sultan, infoPortions.zat_b7_actor_help_bandits])) {
        giveInfo(infoPortions.kingpin_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_kingpin,
          senderId: achievementIcons[EAchievement.KINGPIN],
        });
      }
    }

    return hasAlifeInfo(infoPortions.kingpin_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedHeraldOfJustice(): boolean {
    if (!hasAlifeInfo(infoPortions.herald_of_justice_achievement_gained)) {
      if (
        hasAlifeInfos([
          infoPortions.jup_b25_flint_blame_done_to_duty,
          infoPortions.jup_b25_flint_blame_done_to_freedom,
          infoPortions.zat_b106_found_soroka_done,
        ])
      ) {
        giveInfo(infoPortions.herald_of_justice_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_herald_of_justice,
          senderId: achievementIcons[EAchievement.HERALD_OF_JUSTICE],
        });
      }
    }

    return hasAlifeInfo(infoPortions.herald_of_justice_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedSeeker(): boolean {
    if (hasAlifeInfo(infoPortions.sim_bandit_attack_harder)) {
      return true;
    }

    for (const [artefactId, isArtefactFound] of StatisticsManager.getInstance().artefacts_table) {
      if (!isArtefactFound) {
        return false;
      }
    }

    giveInfo(infoPortions.sim_bandit_attack_harder);
    increaseNumberRelationBetweenCommunityAndId(communities.stalker, registry.actor.id(), 200);

    EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TIP,
      caption: captions.st_ach_seeker,
      senderId: achievementIcons[EAchievement.SEEKER],
    });

    return true;
  }

  /**
   * todo: Description.
   */
  public checkAchievedBattleSystemsMaster(): boolean {
    if (!hasAlifeInfo(infoPortions.battle_systems_master_achievement_gained)) {
      if (hasAlifeInfo(infoPortions.zat_b3_all_instruments_brought)) {
        giveInfo(infoPortions.battle_systems_master_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_battle_systems_master,
          senderId: achievementIcons[EAchievement.BATTLE_SYSTEMS_MASTER],
        });
      }
    }

    return hasAlifeInfo(infoPortions.battle_systems_master_achievement_gained);
  }

  /**
   * Check whether high-tech master achievement is completed.
   */
  public checkAchievedHighTechMaster(): boolean {
    if (!hasAlifeInfo(infoPortions.high_tech_master_achievement_gained)) {
      if (
        hasAlifeInfos([
          infoPortions.jup_b217_tech_instrument_1_brought,
          infoPortions.jup_b217_tech_instrument_2_brought,
          infoPortions.jup_b217_tech_instrument_3_brought,
        ])
      ) {
        giveInfo(infoPortions.high_tech_master_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_high_tech_master,
          senderId: achievementIcons[EAchievement.HIGH_TECH_MASTER],
        });
      }
    }

    return hasAlifeInfo(infoPortions.high_tech_master_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedSkilledStalker(): boolean {
    if (!hasAlifeInfo(infoPortions.skilled_stalker_achievement_gained)) {
      if (hasAlifeInfo(infoPortions.actor_was_in_many_bad_places)) {
        giveInfo(infoPortions.skilled_stalker_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_skilled_stalker,
          senderId: achievementIcons[EAchievement.SKILLED_STALKER],
        });
      }
    }

    return hasAlifeInfo(infoPortions.skilled_stalker_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedLeader(): boolean {
    if (!hasAlifeInfo(infoPortions.leader_achievement_gained)) {
      if (
        hasAlifeInfos([
          infoPortions.jup_a10_vano_agree_go_und,
          infoPortions.jup_b218_soldier_hired,
          infoPortions.jup_b218_monolith_hired,
        ])
      ) {
        giveInfo(infoPortions.leader_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_leader,
          senderId: achievementIcons[EAchievement.LEADER],
        });
      }
    }

    return hasAlifeInfo(infoPortions.leader_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedDiplomat(): boolean {
    if (!hasAlifeInfo(infoPortions.diplomat_achievement_gained)) {
      if (
        hasFewAlifeInfos(
          [
            infoPortions.jup_a12_wo_shooting,
            infoPortions.jup_a10_bandit_take_all_money,
            infoPortions.jup_a10_bandit_take_money,
          ],
          2
        )
      ) {
        giveInfo(infoPortions.diplomat_achievement_gained);

        const actorId: TNumberId = registry.actor.id();

        increaseNumberRelationBetweenCommunityAndId(communities.stalker, actorId, 200);
        increaseNumberRelationBetweenCommunityAndId(communities.freedom, actorId, 200);
        increaseNumberRelationBetweenCommunityAndId(communities.dolg, actorId, 200);
        increaseNumberRelationBetweenCommunityAndId(communities.bandit, actorId, 200);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_diplomat,
          senderId: achievementIcons[EAchievement.DIPLOMAT],
        });
      }
    }

    return hasAlifeInfo(infoPortions.diplomat_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedResearchMan(): boolean {
    if (!hasAlifeInfo(infoPortions.research_man_gained)) {
      if (
        hasFewAlifeInfos(
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
        giveInfo(infoPortions.research_man_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_research_man,
          senderId: achievementIcons[EAchievement.RESEARCH_MAN],
        });
      }
    }

    return hasAlifeInfo(infoPortions.research_man_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedFriendOfDuty(): boolean {
    if (!hasAlifeInfo(infoPortions.sim_duty_help_harder)) {
      if (
        hasAlifeInfos([
          infoPortions.jup_b4_monolith_squad_in_duty,
          infoPortions.jup_b46_duty_founder_pda_to_duty,
          infoPortions.jup_b207_sell_dealers_pda_duty,
          infoPortions.jup_b25_flint_blame_done_to_duty,
        ])
      ) {
        giveInfo(infoPortions.sim_duty_help_harder);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_friend_of_duty,
          senderId: achievementIcons[EAchievement.FRIEND_OF_DUTY],
        });
      }
    }

    return hasAlifeInfo(infoPortions.sim_duty_help_harder);
  }

  /**
   * todo: Description.
   */
  public checkAchievedFriendOfFreedom(): boolean {
    if (!hasAlifeInfo(infoPortions.sim_freedom_help_harder)) {
      if (
        hasAlifeInfos([
          infoPortions.jup_b4_monolith_squad_in_freedom,
          infoPortions.jup_b46_duty_founder_pda_to_freedom,
          infoPortions.jup_b207_sell_dealers_pda_freedom,
          infoPortions.jup_b25_flint_blame_done_to_freedom,
        ])
      ) {
        giveInfo(infoPortions.sim_freedom_help_harder);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_friend_of_freedom,
          senderId: achievementIcons[EAchievement.FRIEND_OF_FREEDOM],
        });
      }
    }

    return hasAlifeInfo(infoPortions.sim_freedom_help_harder);
  }

  /**
   * todo: Description.
   */
  public checkAchievedBalanceAdvocate(): boolean {
    if (!hasAlifeInfo(infoPortions.balance_advocate_gained)) {
      if (
        hasAlifeInfos([
          infoPortions.jup_b46_duty_founder_pda_to_owl,
          infoPortions.jup_b207_dealers_pda_sold_owl,
          infoPortions.zat_b106_found_soroka_done,
        ])
      ) {
        giveInfo(infoPortions.balance_advocate_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_balance_advocate,
          senderId: achievementIcons[EAchievement.BALANCE_ADVOCATE],
        });
      }
    }

    return hasAlifeInfo(infoPortions.balance_advocate_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedWealthy(): boolean {
    if (!hasAlifeInfo(infoPortions.actor_wealthy) && registry.actor.money() >= 100_000) {
      giveInfo(infoPortions.actor_wealthy);

      EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: captions.st_ach_wealthy,
        senderId: achievementIcons[EAchievement.WEALTHY],
      });
    }

    return hasAlifeInfo(infoPortions.actor_wealthy);
  }

  /**
   * todo: Description.
   */
  public checkAchievedKeeperOfSecrets(): boolean {
    if (!hasAlifeInfo(infoPortions.keeper_of_secrets_achievement_gained)) {
      if (hasAlifeInfo(infoPortions.pri_b305_all_strelok_notes_given)) {
        giveInfo(infoPortions.keeper_of_secrets_achievement_gained);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_keeper_of_secrets,
          senderId: achievementIcons[EAchievement.KEEPER_OF_SECRETS],
        });
      }
    }

    return hasAlifeInfo(infoPortions.keeper_of_secrets_achievement_gained);
  }

  /**
   * todo: Description.
   */
  public checkAchievedMarkedByZone(): boolean {
    if (hasAlifeInfo(infoPortions.actor_marked_by_zone_3_times)) {
      return true;
    }

    if (StatisticsManager.getInstance().getUsedAnabioticsCount() >= 3) {
      giveInfo(infoPortions.actor_marked_by_zone_3_times);

      EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: captions.st_ach_marked_by_zone,
        senderId: achievementIcons[EAchievement.MARKED_BY_ZONE],
      });

      return true;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public checkAchievedInformationDealer(): boolean {
    if (!hasAlifeInfo(infoPortions.actor_information_dealer)) {
      if (
        hasFewAlifeInfos(
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
        giveInfo(infoPortions.actor_information_dealer);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_information_dealer,
          senderId: achievementIcons[EAchievement.INFORMATION_DEALER],
        });
      }
    }

    return hasAlifeInfo(infoPortions.actor_information_dealer);
  }

  /**
   * todo: Description.
   */
  public checkAchievedFriendOfStalkers(): boolean {
    if (!hasAlifeInfo(infoPortions.sim_stalker_help_harder)) {
      if (
        hasAlifeInfos([
          infoPortions.jup_b220_trapper_zaton_chimera_hunted_told,
          infoPortions.jup_a12_stalker_prisoner_helped,
          infoPortions.jup_a10_vano_give_task_end,
          infoPortions.zat_b5_stalker_leader_end,
          infoPortions.zat_b7_task_end,
        ])
      ) {
        giveInfo(infoPortions.sim_stalker_help_harder);
        increaseNumberRelationBetweenCommunityAndId(communities.stalker, registry.actor.id(), 100);

        EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
          type: ENotificationType.TIP,
          caption: captions.st_ach_friend_of_stalkers,
          senderId: achievementIcons[EAchievement.FRIEND_OF_STALKERS],
        });
      }
    }

    return hasAlifeInfo(infoPortions.sim_stalker_help_harder);
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    this.updateDetectiveAchievementRewardSpawn();
    this.updateMutantHunterAchievementSpawn();
  }

  /**
   * todo: Description.
   */
  protected updateDetectiveAchievementRewardSpawn(): void {
    if (!hasAlifeInfo(infoPortions.detective_achievement_gained)) {
      return;
    } else if (this.lastDetectiveAchievementSpawnTime === null) {
      this.lastDetectiveAchievementSpawnTime = game.get_game_time();
    }

    if (
      game.get_game_time().diffSec(this.lastDetectiveAchievementSpawnTime) >
      achievementRewards.ACHIEVEMENT_REWARD_SPAWN_PERIOD
    ) {
      spawnItemsForObjectFromList(
        alife().object(getObjectIdByStoryId(achievementRewards.REWARD_BOXES.ZATON)!)!,
        achievementRewards.ITEMS[EAchievement.DETECTIVE],
        4
      );

      EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: captions.st_detective_news,
        senderId: notificationManagerIcons.got_medicine,
      });

      this.lastDetectiveAchievementSpawnTime = game.get_game_time();
    }
  }

  /**
   * todo: Description.
   */
  protected updateMutantHunterAchievementSpawn(): void {
    if (!hasAlifeInfo(infoPortions.mutant_hunter_achievement_gained)) {
      return;
    } else if (this.lastMutantHunterAchievementSpawnTime === null) {
      this.lastMutantHunterAchievementSpawnTime = game.get_game_time();
    }

    if (
      game.get_game_time().diffSec(this.lastMutantHunterAchievementSpawnTime) >
      achievementRewards.ACHIEVEMENT_REWARD_SPAWN_PERIOD
    ) {
      spawnItemsForObjectFromList(
        alife().object(getObjectIdByStoryId(achievementRewards.REWARD_BOXES.JUPITER)!)!,
        achievementRewards.ITEMS[EAchievement.MUTANT_HUNTER],
        5
      );

      EventsManager.getInstance().emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: captions.st_mutant_hunter_news,
        senderId: notificationManagerIcons.got_ammo,
      });

      this.lastMutantHunterAchievementSpawnTime = game.get_game_time();
    }
  }

  /**
   * todo;
   * todo: Probably named section.
   */
  public override save(packet: XR_net_packet): void {
    if (this.lastDetectiveAchievementSpawnTime === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeTimeToPacket(packet, this.lastDetectiveAchievementSpawnTime);
    }

    if (this.lastMutantHunterAchievementSpawnTime === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeTimeToPacket(packet, this.lastMutantHunterAchievementSpawnTime);
    }
  }

  /**
   * todo: Description.
   */
  public override load(reader: TXR_net_processor): void {
    const hasSpawnedDetectiveLoot: boolean = reader.r_bool();

    if (hasSpawnedDetectiveLoot) {
      this.lastDetectiveAchievementSpawnTime = readTimeFromPacket(reader);
    }

    const hasSpawnedMutantHunterLoot: boolean = reader.r_bool();

    if (hasSpawnedMutantHunterLoot) {
      this.lastMutantHunterAchievementSpawnTime = readTimeFromPacket(reader);
    }
  }
}
