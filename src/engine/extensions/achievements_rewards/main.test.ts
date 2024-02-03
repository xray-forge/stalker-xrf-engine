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
});
