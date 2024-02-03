import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CTime, game } from "xray16";

import { getManager, registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationType, notificationsIcons } from "@/engine/core/managers/notifications";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { achievementRewardsConfig } from "@/engine/extensions/achievements_rewards/AchievementRewardsConfig";
import { update } from "@/engine/extensions/achievements_rewards/update";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { ServerObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeObject, MockCTime } from "@/fixtures/xray";

describe("achievement rewards extension", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();

    achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = null;
    achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = null;
  });

  it("should correctly handle update with no achievements", () => {
    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);

    update();

    expect(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT).toBeNull();
    expect(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT).toBeNull();
    expect(registry.simulator.create).not.toHaveBeenCalled();
    expect(registry.simulator.create_ammo).not.toHaveBeenCalled();
  });

  it("should correctly handle update with achievements", () => {
    giveInfoPortion(infoPortions.detective_achievement_gained);
    giveInfoPortion(infoPortions.mutant_hunter_achievement_gained);

    update();

    expect(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT).not.toBeNull();
    expect(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT).not.toBeNull();
  });

  it("should correctly handle update with detective", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const box: ServerObject = MockAlifeObject.mock();

    jest.spyOn(eventsManager, "emitEvent").mockImplementation(jest.fn());

    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);
    replaceFunctionMock(game.get_game_time, () => MockCTime.mock(2012, 6, 25, 12, 35, 30, 500));

    registerStoryLink(box.id, achievementRewardsConfig.REWARD_BOXES.ZATON);
    giveInfoPortion(infoPortions.detective_achievement_gained);

    update();

    expect(String(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT)).toBe(String(game.get_game_time()));
    expect(registry.simulator.create).not.toHaveBeenCalled();
    expect(registry.simulator.create_ammo).not.toHaveBeenCalled();

    const newTime: CTime = MockCTime.mock(2020, 6, 25, 12, 35, 30, 500);

    replaceFunctionMock(game.get_game_time, () => newTime);

    update();

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
    const box: ServerObject = MockAlifeObject.mock();

    jest.spyOn(eventsManager, "emitEvent").mockImplementation(jest.fn());

    resetFunctionMock(registry.simulator.create);
    resetFunctionMock(registry.simulator.create_ammo);
    replaceFunctionMock(game.get_game_time, () => MockCTime.mock(2012, 6, 25, 12, 35, 30, 500));

    registerStoryLink(box.id, achievementRewardsConfig.REWARD_BOXES.JUPITER);
    giveInfoPortion(infoPortions.mutant_hunter_achievement_gained);

    update();

    expect(String(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT)).toBe(String(game.get_game_time()));
    expect(registry.simulator.create).not.toHaveBeenCalled();

    const newTime: CTime = MockCTime.mock(2020, 6, 25, 12, 35, 30, 500);

    replaceFunctionMock(game.get_game_time, () => newTime);

    update();

    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TIP,
      caption: "st_mutant_hunter_news",
      senderId: notificationsIcons.got_ammo,
    });
    expect(registry.simulator.create).not.toHaveBeenCalled();
    expect(registry.simulator.create_ammo).toHaveBeenCalledTimes(5);
    expect(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT).toBe(newTime);
  });
});
