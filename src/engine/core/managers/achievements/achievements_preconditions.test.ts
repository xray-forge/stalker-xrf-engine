import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { relation_registry } from "xray16";

import { disposeManager, registerActor, registry } from "@/engine/core/database";
import { achievementIcons } from "@/engine/core/managers/achievements/achievements_icons";
import {
  hasAchievedBalanceAdvocate,
  hasAchievedBattleSystemsMaster,
  hasAchievedDetective,
  hasAchievedDiplomat,
  hasAchievedFriendOfDuty,
  hasAchievedFriendOfFreedom,
  hasAchievedFriendOfStalkers,
  hasAchievedHeraldOfJustice,
  hasAchievedHighTechMaster,
  hasAchievedInformationDealer,
  hasAchievedKeeperOfSecrets,
  hasAchievedKingpin,
  hasAchievedLeader,
  hasAchievedMarkedByZone,
  hasAchievedMutantHunter,
  hasAchievedOneOfLads,
  hasAchievedPioneer,
  hasAchievedResearchMan,
  hasAchievedSeeker,
  hasAchievedSkilledStalker,
  hasAchievedWealthy,
} from "@/engine/core/managers/achievements/achievements_preconditions";
import { achievementRewards } from "@/engine/core/managers/achievements/achievements_rewards";
import { EAchievement } from "@/engine/core/managers/achievements/achievements_types";
import { AchievementsManager } from "@/engine/core/managers/achievements/AchievementsManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationType, ITipNotification } from "@/engine/core/managers/notifications";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { artefacts } from "@/engine/lib/constants/items/artefacts";
import { TName } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { mockActorClientGameObject, mockClientGameObject } from "@/fixtures/xray";

describe("AchievementManager class", () => {
  const mockNotificationListener = (caption: string, senderId: string) => {
    const eventsManager: EventsManager = EventsManager.getInstance();

    const onNotification = jest.fn((notification: ITipNotification) => {
      expect(notification.type).toBe(ENotificationType.TIP);
      expect(notification.caption).toBe(caption);
      expect(notification.senderId).toBe(senderId);
    });

    eventsManager.registerCallback(EGameEvent.NOTIFICATION, onNotification);

    return onNotification;
  };

  const checkGenericAchievement = ({
    check,
    achievementInfo,
    requiredInfos,
    notificationIcon,
    notificationCaption,
  }: {
    check: () => boolean;
    requiredInfos: Array<TInfoPortion>;
    notificationCaption: string;
    notificationIcon: string;
    achievementInfo: TInfoPortion;
  }) => {
    const onNotification = mockNotificationListener(notificationCaption, notificationIcon);

    giveInfo(achievementInfo);
    expect(check()).toBeTruthy();

    disableInfo(achievementInfo);
    expect(check()).toBeFalsy();

    requiredInfos.forEach((it) => giveInfo(it));

    expect(check()).toBeTruthy();
    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(hasAlifeInfo(achievementInfo)).toBeTruthy();
  };

  beforeEach(() => {
    disposeManager(EventsManager);
    registerActor(mockActorClientGameObject());
  });

  it("should correctly check pioneer achievement", () => {
    checkGenericAchievement({
      check: hasAchievedPioneer,
      notificationCaption: "st_ach_pioneer",
      notificationIcon: achievementIcons[EAchievement.PIONEER],
      achievementInfo: infoPortions.pioneer_achievement_gained,
      requiredInfos: [
        infoPortions.zat_b14_give_item_linker,
        infoPortions.jup_b1_complete_end,
        infoPortions.jup_b206_anomalous_grove_done,
      ],
    });
  });

  it("should correctly check mutant hunter achievement", () => {
    checkGenericAchievement({
      check: hasAchievedMutantHunter,
      notificationCaption: "st_ach_mutant_hunter",
      notificationIcon: achievementIcons[EAchievement.MUTANT_HUNTER],
      achievementInfo: infoPortions.mutant_hunter_achievement_gained,
      requiredInfos: [
        infoPortions.jup_b208_burers_hunt_done,
        infoPortions.jup_b211_scene_done,
        infoPortions.jup_b212_jupiter_chimera_hunt_done,
      ],
    });
  });

  it("should correctly check detective achievement", () => {
    checkGenericAchievement({
      check: hasAchievedDetective,
      notificationCaption: "st_ach_detective",
      notificationIcon: achievementIcons[EAchievement.DETECTIVE],
      achievementInfo: infoPortions.detective_achievement_gained,
      requiredInfos: [infoPortions.zat_b22_barmen_gave_reward],
    });
  });

  it("should correctly check one of lads achievement", () => {
    checkGenericAchievement({
      check: hasAchievedOneOfLads,
      notificationCaption: "st_ach_one_of_the_lads",
      notificationIcon: achievementIcons[EAchievement.ONE_OF_THE_LADS],
      achievementInfo: infoPortions.one_of_the_lads_gained,
      requiredInfos: [infoPortions.zat_b30_sultan_loose, infoPortions.zat_b7_actor_help_stalkers],
    });
  });

  it("should correctly check kingpin achievement", () => {
    checkGenericAchievement({
      check: hasAchievedKingpin,
      notificationCaption: "st_ach_kingpin",
      notificationIcon: achievementIcons[EAchievement.KINGPIN],
      achievementInfo: infoPortions.kingpin_gained,
      requiredInfos: [infoPortions.zat_b30_barmen_under_sultan, infoPortions.zat_b7_actor_help_bandits],
    });
  });

  it("should correctly check herald of justice achievement", () => {
    checkGenericAchievement({
      check: hasAchievedHeraldOfJustice,
      notificationCaption: "st_ach_herald_of_justice",
      notificationIcon: achievementIcons[EAchievement.HERALD_OF_JUSTICE],
      achievementInfo: infoPortions.herald_of_justice_achievement_gained,
      requiredInfos: [
        infoPortions.jup_b25_flint_blame_done_to_duty,
        infoPortions.jup_b25_flint_blame_done_to_freedom,
        infoPortions.zat_b106_found_soroka_done,
      ],
    });
  });

  it("should correctly check battle systems master achievement", () => {
    checkGenericAchievement({
      check: hasAchievedBattleSystemsMaster,
      notificationCaption: "st_ach_battle_systems_master",
      notificationIcon: achievementIcons[EAchievement.BATTLE_SYSTEMS_MASTER],
      achievementInfo: infoPortions.battle_systems_master_achievement_gained,
      requiredInfos: [infoPortions.zat_b3_all_instruments_brought],
    });
  });

  it("should correctly check high tech master achievement", () => {
    checkGenericAchievement({
      check: hasAchievedHighTechMaster,
      notificationCaption: "st_ach_high_tech_master",
      notificationIcon: achievementIcons[EAchievement.HIGH_TECH_MASTER],
      achievementInfo: infoPortions.high_tech_master_achievement_gained,
      requiredInfos: [
        infoPortions.jup_b217_tech_instrument_1_brought,
        infoPortions.jup_b217_tech_instrument_2_brought,
        infoPortions.jup_b217_tech_instrument_3_brought,
      ],
    });
  });

  it("should correctly check skilled stalker achievement", () => {
    checkGenericAchievement({
      check: hasAchievedSkilledStalker,
      notificationCaption: "st_ach_skilled_stalker",
      notificationIcon: achievementIcons[EAchievement.SKILLED_STALKER],
      achievementInfo: infoPortions.skilled_stalker_achievement_gained,
      requiredInfos: [infoPortions.actor_was_in_many_bad_places],
    });
  });

  it("should correctly check leader achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: hasAchievedLeader,
      notificationCaption: "st_ach_leader",
      notificationIcon: achievementIcons[EAchievement.LEADER],
      achievementInfo: infoPortions.leader_achievement_gained,
      requiredInfos: [
        infoPortions.jup_a10_vano_agree_go_und,
        infoPortions.jup_b218_soldier_hired,
        infoPortions.jup_b218_monolith_hired,
      ],
    });
  });

  it("should correctly check diplomat achievement", () => {
    checkGenericAchievement({
      check: hasAchievedDiplomat,
      notificationCaption: "st_ach_diplomat",
      notificationIcon: achievementIcons[EAchievement.DIPLOMAT],
      achievementInfo: infoPortions.diplomat_achievement_gained,
      requiredInfos: [infoPortions.jup_a12_wo_shooting, infoPortions.jup_a10_bandit_take_all_money],
    });

    expect(relation_registry.change_community_goodwill).toHaveBeenCalledTimes(4);

    registerActor(mockClientGameObject());

    checkGenericAchievement({
      check: hasAchievedDiplomat,
      notificationCaption: "st_ach_diplomat",
      notificationIcon: achievementIcons[EAchievement.DIPLOMAT],
      achievementInfo: infoPortions.diplomat_achievement_gained,
      requiredInfos: [infoPortions.jup_a12_wo_shooting, infoPortions.jup_a10_bandit_take_money],
    });

    expect(relation_registry.change_community_goodwill).toHaveBeenCalledTimes(8);
  });

  it("should correctly check research man achievement", () => {
    checkGenericAchievement({
      check: () => hasAchievedResearchMan(),
      notificationCaption: "st_ach_research_man",
      notificationIcon: achievementIcons[EAchievement.RESEARCH_MAN],
      achievementInfo: infoPortions.research_man_gained,
      requiredInfos: [
        infoPortions.jup_b16_task_done,
        infoPortions.jup_b1_task_done,
        infoPortions.jup_b46_task_done,
        infoPortions.jup_b47_task_end,
      ],
    });

    registerActor(mockClientGameObject());

    checkGenericAchievement({
      check: () => hasAchievedResearchMan(),
      notificationCaption: "st_ach_research_man",
      notificationIcon: achievementIcons[EAchievement.RESEARCH_MAN],
      achievementInfo: infoPortions.research_man_gained,
      requiredInfos: [
        infoPortions.jup_b32_task_done,
        infoPortions.jup_b6_task_done,
        infoPortions.jup_b206_task_done,
        infoPortions.jup_b209_task_done,
      ],
    });
  });

  it("should correctly check friends with duty achievement", () => {
    checkGenericAchievement({
      check: () => hasAchievedFriendOfDuty(),
      notificationCaption: "st_ach_friend_of_duty",
      notificationIcon: achievementIcons[EAchievement.FRIEND_OF_DUTY],
      achievementInfo: infoPortions.sim_duty_help_harder,
      requiredInfos: [
        infoPortions.jup_b4_monolith_squad_in_duty,
        infoPortions.jup_b46_duty_founder_pda_to_duty,
        infoPortions.jup_b207_sell_dealers_pda_duty,
        infoPortions.jup_b25_flint_blame_done_to_duty,
      ],
    });
  });

  it("should correctly check friends with freedom achievement", () => {
    checkGenericAchievement({
      check: () => hasAchievedFriendOfFreedom(),
      notificationCaption: "st_ach_friend_of_freedom",
      notificationIcon: achievementIcons[EAchievement.FRIEND_OF_FREEDOM],
      achievementInfo: infoPortions.sim_freedom_help_harder,
      requiredInfos: [
        infoPortions.jup_b4_monolith_squad_in_freedom,
        infoPortions.jup_b46_duty_founder_pda_to_freedom,
        infoPortions.jup_b207_sell_dealers_pda_freedom,
        infoPortions.jup_b25_flint_blame_done_to_freedom,
      ],
    });
  });

  it("should correctly check balance advocate achievement", () => {
    checkGenericAchievement({
      check: () => hasAchievedBalanceAdvocate(),
      notificationCaption: "st_ach_balance_advocate",
      notificationIcon: achievementIcons[EAchievement.BALANCE_ADVOCATE],
      achievementInfo: infoPortions.balance_advocate_gained,
      requiredInfos: [
        infoPortions.jup_b46_duty_founder_pda_to_owl,
        infoPortions.jup_b207_dealers_pda_sold_owl,
        infoPortions.zat_b106_found_soroka_done,
      ],
    });
  });

  it("should correctly check keeper of secrets achievement", () => {
    checkGenericAchievement({
      check: () => hasAchievedKeeperOfSecrets(),
      notificationCaption: "st_ach_keeper_of_secrets",
      notificationIcon: achievementIcons[EAchievement.KEEPER_OF_SECRETS],
      achievementInfo: infoPortions.keeper_of_secrets_achievement_gained,
      requiredInfos: [infoPortions.pri_b305_all_strelok_notes_given],
    });
  });

  it("should correctly check information dealer achievement", () => {
    checkGenericAchievement({
      check: () => hasAchievedInformationDealer(),
      notificationCaption: "st_ach_information_dealer",
      notificationIcon: achievementIcons[EAchievement.INFORMATION_DEALER],
      achievementInfo: infoPortions.actor_information_dealer,
      requiredInfos: [
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
      ],
    });

    registerActor(mockClientGameObject());

    checkGenericAchievement({
      check: () => hasAchievedInformationDealer(),
      notificationCaption: "st_ach_information_dealer",
      notificationIcon: achievementIcons[EAchievement.INFORMATION_DEALER],
      achievementInfo: infoPortions.actor_information_dealer,
      requiredInfos: [
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
    });
  });

  it("should correctly check friend of stalkers achievement", () => {
    checkGenericAchievement({
      check: () => hasAchievedFriendOfStalkers(),
      notificationCaption: "st_ach_friend_of_stalkers",
      notificationIcon: achievementIcons[EAchievement.FRIEND_OF_STALKERS],
      achievementInfo: infoPortions.sim_stalker_help_harder,
      requiredInfos: [
        infoPortions.jup_b220_trapper_zaton_chimera_hunted_told,
        infoPortions.jup_a12_stalker_prisoner_helped,
        infoPortions.jup_a10_vano_give_task_end,
        infoPortions.zat_b5_stalker_leader_end,
        infoPortions.zat_b7_task_end,
      ],
    });

    expect(relation_registry.change_community_goodwill).toHaveBeenCalledWith(
      communities.stalker,
      registry.actor.id(),
      100
    );
  });

  it("should correctly check wealthy achievement", () => {
    const onNotification = mockNotificationListener("st_ach_wealthy", achievementIcons[EAchievement.WEALTHY]);

    giveInfo(infoPortions.actor_wealthy);
    expect(hasAchievedWealthy()).toBeTruthy();

    disableInfo(infoPortions.actor_wealthy);
    expect(hasAchievedWealthy()).toBeFalsy();

    registry.actor.give_money(25_000);
    expect(hasAchievedWealthy()).toBeFalsy();

    registry.actor.give_money(75_000);
    expect(hasAchievedWealthy()).toBeTruthy();
    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(hasAlifeInfo(infoPortions.actor_wealthy)).toBeTruthy();
  });

  it("should correctly check seeker achievement", () => {
    const statisticsManager: StatisticsManager = StatisticsManager.getInstance();
    const onNotification = mockNotificationListener("st_ach_seeker", achievementIcons[EAchievement.SEEKER]);

    giveInfo(infoPortions.sim_bandit_attack_harder);
    expect(hasAchievedSeeker()).toBeTruthy();

    disableInfo(infoPortions.sim_bandit_attack_harder);

    StatisticsManager.getInstance().actorStatistics.collectedArtefacts = MockLuaTable.mockFromObject({
      [artefacts.af_baloon]: true,
      [artefacts.af_blood]: false,
    } as Record<TName, boolean>);

    expect(hasAchievedSeeker()).toBeFalsy();

    statisticsManager.actorStatistics.collectedArtefacts = new LuaTable();

    for (const it of $range(1, achievementRewards.ARTEFACTS_SEEKER_UNIQUES_REQUIRED)) {
      statisticsManager.actorStatistics.collectedArtefacts.set("af_" + it, true);
    }

    expect(hasAchievedSeeker()).toBeTruthy();
    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(hasAlifeInfo(infoPortions.sim_bandit_attack_harder)).toBeTruthy();

    expect(relation_registry.change_community_goodwill).toHaveBeenCalledWith(
      communities.stalker,
      registry.actor.id(),
      200
    );
  });

  it("should correctly check marked by zone achievement", () => {
    const statisticsManager: StatisticsManager = StatisticsManager.getInstance();
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();
    const onNotification = mockNotificationListener(
      "st_ach_marked_by_zone",
      achievementIcons[EAchievement.MARKED_BY_ZONE]
    );

    giveInfo(infoPortions.actor_marked_by_zone_3_times);
    expect(hasAchievedMarkedByZone()).toBeTruthy();

    disableInfo(infoPortions.actor_marked_by_zone_3_times);
    expect(hasAchievedMarkedByZone()).toBeFalsy();

    statisticsManager.onSurvivedSurgeWithAnabiotic();
    statisticsManager.onSurvivedSurgeWithAnabiotic();
    expect(hasAchievedMarkedByZone()).toBeFalsy();

    statisticsManager.onSurvivedSurgeWithAnabiotic();
    expect(hasAchievedMarkedByZone()).toBeTruthy();
    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(hasAlifeInfo(infoPortions.actor_marked_by_zone_3_times)).toBeTruthy();
  });
});
