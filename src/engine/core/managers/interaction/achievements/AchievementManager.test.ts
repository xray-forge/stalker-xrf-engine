import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { relation_registry } from "xray16";

import { disposeManager, getManagerInstance, registerActor, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers";
import { achievementIcons } from "@/engine/core/managers/interaction/achievements/AchievementIcons";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements/AchievementsManager";
import { EAchievement } from "@/engine/core/managers/interaction/achievements/types";
import { ENotificationType, ITipNotification } from "@/engine/core/managers/interface";
import { StatisticsManager } from "@/engine/core/managers/interface/StatisticsManager";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { captions } from "@/engine/lib/constants/captions";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { artefacts, TArtefact } from "@/engine/lib/constants/items/artefacts";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { mockClientGameObject } from "@/fixtures/xray";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

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
    registerActor(mockClientGameObject());
  });

  it("should correctly initialize and destroy", () => {
    const achievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(1);

    expect(achievementsManager.lastDetectiveAchievementSpawnTime).toBeNull();
    expect(achievementsManager.lastMutantHunterAchievementSpawnTime).toBeNull();

    disposeManager(AchievementsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly save and load by default", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const achievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);

    achievementsManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.BOOLEAN, EPacketDataType.BOOLEAN]);
    expect(netProcessor.dataList).toEqual([false, false]);

    disposeManager(WeatherManager);

    const newAchievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);

    newAchievementsManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newAchievementsManager).toBe(achievementsManager);
  });

  it("should correctly save and load when state is updated", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const achievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);

    achievementsManager.lastDetectiveAchievementSpawnTime = MockCTime.mock(2023, 4, 16, 10, 57, 4, 400);
    achievementsManager.lastMutantHunterAchievementSpawnTime = MockCTime.mock(2012, 2, 24, 5, 33, 2, 0);

    achievementsManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([true, 23, 4, 16, 10, 57, 4, 400, true, 12, 2, 24, 5, 33, 2, 0]);

    disposeManager(WeatherManager);

    const newAchievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);

    newAchievementsManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newAchievementsManager).toBe(achievementsManager);
  });

  it("should correctly check achievements by with generic method", () => {
    const achievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);

    expect(achievementsManager.checkAchieved(EAchievement.DETECTIVE)).toBeFalsy();
    expect(achievementsManager.checkAchieved(EAchievement.ONE_OF_THE_LADS)).toBeFalsy();

    giveInfo(infoPortions.zat_b22_barmen_gave_reward);
    giveInfo(infoPortions.zat_b30_sultan_loose);
    giveInfo(infoPortions.zat_b7_actor_help_stalkers);

    expect(achievementsManager.checkAchieved(EAchievement.DETECTIVE)).toBeTruthy();
    expect(achievementsManager.checkAchieved(EAchievement.ONE_OF_THE_LADS)).toBeTruthy();
  });

  it("should correctly check pioneer achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedPioneer(),
      notificationCaption: captions.st_ach_pioneer,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedMutantHunter(),
      notificationCaption: captions.st_ach_mutant_hunter,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedDetective(),
      notificationCaption: captions.st_ach_detective,
      notificationIcon: achievementIcons[EAchievement.DETECTIVE],
      achievementInfo: infoPortions.detective_achievement_gained,
      requiredInfos: [infoPortions.zat_b22_barmen_gave_reward],
    });
  });

  it("should correctly check one of lads achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedOneOfLads(),
      notificationCaption: captions.st_ach_one_of_the_lads,
      notificationIcon: achievementIcons[EAchievement.ONE_OF_THE_LADS],
      achievementInfo: infoPortions.one_of_the_lads_gained,
      requiredInfos: [infoPortions.zat_b30_sultan_loose, infoPortions.zat_b7_actor_help_stalkers],
    });
  });

  it("should correctly check kingpin achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedKingpin(),
      notificationCaption: captions.st_ach_kingpin,
      notificationIcon: achievementIcons[EAchievement.KINGPIN],
      achievementInfo: infoPortions.kingpin_gained,
      requiredInfos: [infoPortions.zat_b30_barmen_under_sultan, infoPortions.zat_b7_actor_help_bandits],
    });
  });

  it("should correctly check herald of justice achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedHeraldOfJustice(),
      notificationCaption: captions.st_ach_herald_of_justice,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedBattleSystemsMaster(),
      notificationCaption: captions.st_ach_battle_systems_master,
      notificationIcon: achievementIcons[EAchievement.BATTLE_SYSTEMS_MASTER],
      achievementInfo: infoPortions.battle_systems_master_achievement_gained,
      requiredInfos: [infoPortions.zat_b3_all_instruments_brought],
    });
  });

  it("should correctly check high tech master achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedHighTechMaster(),
      notificationCaption: captions.st_ach_high_tech_master,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedSkilledStalker(),
      notificationCaption: captions.st_ach_skilled_stalker,
      notificationIcon: achievementIcons[EAchievement.SKILLED_STALKER],
      achievementInfo: infoPortions.skilled_stalker_achievement_gained,
      requiredInfos: [infoPortions.actor_was_in_many_bad_places],
    });
  });

  it("should correctly check leader achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedLeader(),
      notificationCaption: captions.st_ach_leader,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedDiplomat(),
      notificationCaption: captions.st_ach_diplomat,
      notificationIcon: achievementIcons[EAchievement.DIPLOMAT],
      achievementInfo: infoPortions.diplomat_achievement_gained,
      requiredInfos: [infoPortions.jup_a12_wo_shooting, infoPortions.jup_a10_bandit_take_all_money],
    });

    expect(relation_registry.change_community_goodwill).toHaveBeenCalledTimes(4);

    registerActor(mockClientGameObject());

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedDiplomat(),
      notificationCaption: captions.st_ach_diplomat,
      notificationIcon: achievementIcons[EAchievement.DIPLOMAT],
      achievementInfo: infoPortions.diplomat_achievement_gained,
      requiredInfos: [infoPortions.jup_a12_wo_shooting, infoPortions.jup_a10_bandit_take_money],
    });

    expect(relation_registry.change_community_goodwill).toHaveBeenCalledTimes(8);
  });

  it("should correctly check research man achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedResearchMan(),
      notificationCaption: captions.st_ach_research_man,
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
      check: () => achievementsManager.checkAchievedResearchMan(),
      notificationCaption: captions.st_ach_research_man,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedFriendOfDuty(),
      notificationCaption: captions.st_ach_friend_of_duty,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedFriendOfFreedom(),
      notificationCaption: captions.st_ach_friend_of_freedom,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedBalanceAdvocate(),
      notificationCaption: captions.st_ach_balance_advocate,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedKeeperOfSecrets(),
      notificationCaption: captions.st_ach_keeper_of_secrets,
      notificationIcon: achievementIcons[EAchievement.KEEPER_OF_SECRETS],
      achievementInfo: infoPortions.keeper_of_secrets_achievement_gained,
      requiredInfos: [infoPortions.pri_b305_all_strelok_notes_given],
    });
  });

  it("should correctly check information dealer achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedInformationDealer(),
      notificationCaption: captions.st_ach_information_dealer,
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
      check: () => achievementsManager.checkAchievedInformationDealer(),
      notificationCaption: captions.st_ach_information_dealer,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();

    checkGenericAchievement({
      check: () => achievementsManager.checkAchievedFriendOfStalkers(),
      notificationCaption: captions.st_ach_friend_of_stalkers,
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
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();
    const onNotification = mockNotificationListener(captions.st_ach_wealthy, achievementIcons[EAchievement.WEALTHY]);

    giveInfo(infoPortions.actor_wealthy);
    expect(achievementsManager.checkAchievedWealthy()).toBeTruthy();

    disableInfo(infoPortions.actor_wealthy);
    expect(achievementsManager.checkAchievedWealthy()).toBeFalsy();

    registry.actor.give_money(25_000);
    expect(achievementsManager.checkAchievedWealthy()).toBeFalsy();

    registry.actor.give_money(75_000);
    expect(achievementsManager.checkAchievedWealthy()).toBeTruthy();
    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(hasAlifeInfo(infoPortions.actor_wealthy)).toBeTruthy();
  });

  it("should correctly check seeker achievement", () => {
    const achievementsManager: AchievementsManager = AchievementsManager.getInstance();
    const onNotification = mockNotificationListener(captions.st_ach_seeker, achievementIcons[EAchievement.SEEKER]);

    giveInfo(infoPortions.sim_bandit_attack_harder);
    expect(achievementsManager.checkAchievedSeeker()).toBeTruthy();

    disableInfo(infoPortions.sim_bandit_attack_harder);

    StatisticsManager.getInstance().artefacts_table = MockLuaTable.mockFromObject({
      [artefacts.af_baloon]: true,
      [artefacts.af_blood]: false,
    } as Record<TArtefact, boolean>);

    expect(achievementsManager.checkAchievedSeeker()).toBeFalsy();

    StatisticsManager.getInstance().artefacts_table = MockLuaTable.mockFromObject({
      [artefacts.af_baloon]: true,
      [artefacts.af_blood]: true,
    } as Record<TArtefact, boolean>);

    expect(achievementsManager.checkAchievedSeeker()).toBeTruthy();
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
      captions.st_ach_marked_by_zone,
      achievementIcons[EAchievement.MARKED_BY_ZONE]
    );

    giveInfo(infoPortions.actor_marked_by_zone_3_times);
    expect(achievementsManager.checkAchievedMarkedByZone()).toBeTruthy();

    disableInfo(infoPortions.actor_marked_by_zone_3_times);
    expect(achievementsManager.checkAchievedMarkedByZone()).toBeFalsy();

    statisticsManager.incrementAnabioticsUsageCount();
    statisticsManager.incrementAnabioticsUsageCount();
    expect(achievementsManager.checkAchievedMarkedByZone()).toBeFalsy();

    statisticsManager.incrementAnabioticsUsageCount();
    expect(achievementsManager.checkAchievedMarkedByZone()).toBeTruthy();
    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(hasAlifeInfo(infoPortions.actor_marked_by_zone_3_times)).toBeTruthy();
  });
});
