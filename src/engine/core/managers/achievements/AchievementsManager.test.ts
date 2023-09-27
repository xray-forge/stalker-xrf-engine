import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CTime, game } from "xray16";

import {
  disposeManager,
  getManagerInstance,
  registerActor,
  registerSimulator,
  registerStoryLink,
  registry,
} from "@/engine/core/database";
import { achievementRewards } from "@/engine/core/managers/achievements/achievements_rewards";
import { EAchievement } from "@/engine/core/managers/achievements/achievements_types";
import { AchievementsManager } from "@/engine/core/managers/achievements/AchievementsManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationType, notificationsIcons } from "@/engine/core/managers/notifications";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { giveInfo } from "@/engine/core/utils/object/object_info_portion";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { ServerObject } from "@/engine/lib/types";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { mockActorClientGameObject, mockServerAlifeObject } from "@/fixtures/xray";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("AchievementManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();

    registerActor(mockActorClientGameObject());
    registerSimulator();
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

  it("should correctly handle update with no achievements", () => {
    const achievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);

    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);

    achievementsManager.update();

    expect(achievementsManager.lastMutantHunterAchievementSpawnTime).toBeNull();
    expect(achievementsManager.lastDetectiveAchievementSpawnTime).toBeNull();
    expect(registry.simulator.create).not.toHaveBeenCalled();
    expect(registry.simulator.create_ammo).not.toHaveBeenCalled();
  });

  it("should correctly handle update with detective", () => {
    const eventsManager: EventsManager = getManagerInstance(EventsManager);
    const achievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);
    const box: ServerObject = mockServerAlifeObject();

    jest.spyOn(eventsManager, "emitEvent").mockImplementation(jest.fn());

    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);
    replaceFunctionMock(game.get_game_time, () => MockCTime.mock(2012, 6, 25, 12, 35, 30, 500));

    registerStoryLink(box.id, achievementRewards.REWARD_BOXES.ZATON);
    giveInfo(infoPortions.detective_achievement_gained);

    achievementsManager.update();

    expect(String(achievementsManager.lastDetectiveAchievementSpawnTime)).toBe(String(game.get_game_time()));
    expect(registry.simulator.create).not.toHaveBeenCalled();
    expect(registry.simulator.create_ammo).not.toHaveBeenCalled();

    const newTime: CTime = MockCTime.mock(2020, 6, 25, 12, 35, 30, 500);

    replaceFunctionMock(game.get_game_time, () => newTime);

    achievementsManager.update();

    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TIP,
      caption: "st_detective_news",
      senderId: notificationsIcons.got_medicine,
    });
    expect(registry.simulator.create).toHaveBeenCalledTimes(4);
    expect(registry.simulator.create_ammo).toHaveBeenCalledTimes(0);
    expect(achievementsManager.lastDetectiveAchievementSpawnTime).toBe(newTime);
  });

  it("should correctly handle update with monster hunter", () => {
    const eventsManager: EventsManager = getManagerInstance(EventsManager);
    const achievementsManager: AchievementsManager = getManagerInstance(AchievementsManager);
    const box: ServerObject = mockServerAlifeObject();

    jest.spyOn(eventsManager, "emitEvent").mockImplementation(jest.fn());

    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);
    replaceFunctionMock(game.get_game_time, () => MockCTime.mock(2012, 6, 25, 12, 35, 30, 500));

    registerStoryLink(box.id, achievementRewards.REWARD_BOXES.JUPITER);
    giveInfo(infoPortions.mutant_hunter_achievement_gained);

    achievementsManager.update();

    expect(String(achievementsManager.lastMutantHunterAchievementSpawnTime)).toBe(String(game.get_game_time()));
    expect(registry.simulator.create).not.toHaveBeenCalled();

    const newTime: CTime = MockCTime.mock(2020, 6, 25, 12, 35, 30, 500);

    replaceFunctionMock(game.get_game_time, () => newTime);

    achievementsManager.update();

    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TIP,
      caption: "st_mutant_hunter_news",
      senderId: notificationsIcons.got_ammo,
    });
    expect(registry.simulator.create).not.toHaveBeenCalled();
    expect(registry.simulator.create_ammo).toHaveBeenCalledTimes(5);
    expect(achievementsManager.lastMutantHunterAchievementSpawnTime).toBe(newTime);
  });
});
