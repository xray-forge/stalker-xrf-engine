import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManager, getManagerInstance, registerActor } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { EAchievement } from "@/engine/core/managers/interaction/achievements/achievements_types";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements/AchievementsManager";
import { ENotificationType, ITipNotification } from "@/engine/core/managers/interface";
import { WeatherManager } from "@/engine/core/managers/world/WeatherManager";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { mockActorClientGameObject } from "@/fixtures/xray";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("AchievementManager class", () => {
  beforeEach(() => {
    disposeManager(EventsManager);
    registerActor(mockActorClientGameObject());
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

    disposeManager(AchievementsManager);

    const newAchievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);

    newAchievementsManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newAchievementsManager).not.toBe(achievementsManager);
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

  it("should correctly fail on unknown achievement checks", () => {
    const achievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);

    expect(() => achievementsManager.checkAchieved("unknown" as unknown as EAchievement)).toThrow();
    Object.values(EAchievement).forEach((it) => expect(() => achievementsManager.checkAchieved(it)).not.toThrow());
  });
});
