import { beforeEach, describe, expect, it } from "@jest/globals";
import { CTime } from "xray16";

import { getManager } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers/events";
import { achievementRewardsConfig } from "@/engine/extensions/achievements_rewards/AchievementRewardsConfig";
import { load, register, save } from "@/engine/extensions/achievements_rewards/main";
import { AnyObject, Optional } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockCTime } from "@/fixtures/xray";

describe("achievement rewards extension", () => {
  beforeEach(() => {
    resetRegistry();

    achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = null;
    achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = null;
  });

  it("should correctly initialize and destroy", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);

    register();

    expect(eventsManager.getSubscribersCount()).toBe(1);
  });

  it("should correctly save and load", () => {
    const data: AnyObject = {};

    save(data);

    expect(data).toEqual({
      lastDetectiveAchievementSpawnAt: null,
      lastMutantAchievementSpawnAt: null,
    });

    achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = MockCTime.mock(2012, 6, 3, 12, 20, 30, 500);
    achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = MockCTime.mock(2012, 6, 3, 12, 20, 30, 500);

    load(data);

    expect(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT).toBeNull();
    expect(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT).toBeNull();

    achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = MockCTime.mock(2012, 6, 3, 12, 20, 30, 500);
    achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = MockCTime.mock(2016, 6, 3, 12, 20, 30, 500);

    save(data);

    expect(data).toEqual({
      lastDetectiveAchievementSpawnAt: "[2012,6,3,12,20,30,500]",
      lastMutantAchievementSpawnAt: "[2016,6,3,12,20,30,500]",
    });

    achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = null as Optional<CTime>;
    achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = null as Optional<CTime>;

    load(data);

    expect(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT?.toString()).toBe(
      "y:2012, m:6, d:3, h:12, min:20, sec:30, ms:500"
    );
    expect(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT?.toString()).toBe(
      "y:2016, m:6, d:3, h:12, min:20, sec:30, ms:500"
    );
  });

  /*

  it("should correctly handle update with no achievements", () => {
    const achievementsManager: AchievementsManager = getManager(AchievementsManager);

    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);

    achievementsManager.update();

    expect(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT).toBeNull();
    expect(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT).toBeNull();
    expect(registry.simulator.create).not.toHaveBeenCalled();
    expect(registry.simulator.create_ammo).not.toHaveBeenCalled();
  });

  it("should correctly handle update with detective", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const achievementsManager: AchievementsManager = getManager(AchievementsManager);
    const box: ServerObject = mockServerAlifeObject();

    jest.spyOn(eventsManager, "emitEvent").mockImplementation(jest.fn());

    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);
    replaceFunctionMock(game.get_game_time, () => MockCTime.mock(2012, 6, 25, 12, 35, 30, 500));

    registerStoryLink(box.id, achievementRewardsConfig.REWARD_BOXES.ZATON);
    giveInfoPortion(infoPortions.detective_achievement_gained);

    achievementsManager.update();

    expect(String(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT)).toBe(String(game.get_game_time()));
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
    expect(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT).toBe(newTime);
  });

  it("should correctly handle update with monster hunter", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const achievementsManager: AchievementsManager = getManager(AchievementsManager);
    const box: ServerObject = mockServerAlifeObject();

    jest.spyOn(eventsManager, "emitEvent").mockImplementation(jest.fn());

    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);
    replaceFunctionMock(game.get_game_time, () => MockCTime.mock(2012, 6, 25, 12, 35, 30, 500));

    registerStoryLink(box.id, achievementRewardsConfig.REWARD_BOXES.JUPITER);
    giveInfoPortion(infoPortions.mutant_hunter_achievement_gained);

    achievementsManager.update();

    expect(String(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT)).toBe(String(game.get_game_time()));
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
    expect(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT).toBe(newTime);
  });*/
});
