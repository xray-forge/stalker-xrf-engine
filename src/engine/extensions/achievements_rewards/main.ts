import { AnyObject, deserializeTime , serializeTime, TName } from "xray16/lib";
import { $dirname } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";
import { achievementRewardsConfig } from "@/engine/extensions/achievements_rewards/AchievementRewardsConfig";
import { update } from "@/engine/extensions/achievements_rewards/update";

const logger: LuaLogger = new LuaLogger($dirname);

export const name: TName = "Achievement rewards";
export const enabled: boolean = true;

/**
 * Register extension handling vanilla achievements rewards (ammo, medkits etc in chest).
 */
export function register(): void {
  logger.info("Achievement rewards extension registered");

  const eventsManager: EventsManager = getManager(EventsManager);

  eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, update);
}

/**
 * @param data - Generic object to save extension data.
 */
export function save(data: AnyObject): void {
  data.lastDetectiveAchievementSpawnAt = achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT
    ? serializeTime(achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT)
    : null;

  data.lastMutantAchievementSpawnAt = achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT
    ? serializeTime(achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT)
    : null;
}

/**
 * @param data - Generic object to load extension data from.
 */
export function load(data: AnyObject): void {
  achievementRewardsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = data.lastDetectiveAchievementSpawnAt
    ? deserializeTime(data.lastDetectiveAchievementSpawnAt)
    : null;

  achievementRewardsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = data.lastMutantAchievementSpawnAt
    ? deserializeTime(data.lastMutantAchievementSpawnAt)
    : null;
}
