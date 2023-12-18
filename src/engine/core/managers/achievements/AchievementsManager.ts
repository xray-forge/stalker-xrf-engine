import { game } from "xray16";

import { getManager, getObjectIdByStoryId, registry } from "@/engine/core/database";
import { EAchievement } from "@/engine/core/managers/achievements/achievements_types";
import { achievementsConfig } from "@/engine/core/managers/achievements/AchievementsConfig";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationType, ITipNotification, notificationsIcons } from "@/engine/core/managers/notifications";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObjectFromList } from "@/engine/core/utils/spawn";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { infoPortions } from "@/engine/lib/constants/info_portions/info_portions";
import { NetPacket, NetProcessor } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager handling current state of achievements and checking of it.
 */
export class AchievementsManager extends AbstractManager {
  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
  }

  public override update(): void {
    this.updateDetectiveAchievementRewardSpawn();
    this.updateMutantHunterAchievementSpawn();
  }

  /**
   * todo: Description.
   * todo: Move to optional exception.
   */
  protected updateDetectiveAchievementRewardSpawn(): void {
    if (!hasInfoPortion(infoPortions.detective_achievement_gained)) {
      return;
    } else if (!achievementsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT) {
      achievementsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = game.get_game_time();
    }

    if (
      game.get_game_time().diffSec(achievementsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT) >
      achievementsConfig.ACHIEVEMENT_REWARD_SPAWN_PERIOD
    ) {
      spawnItemsForObjectFromList(
        registry.simulator.object(getObjectIdByStoryId(achievementsConfig.REWARD_BOXES.ZATON)!)!,
        achievementsConfig.REWARD_ITEMS[EAchievement.DETECTIVE],
        4
      );

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_detective_news",
        senderId: notificationsIcons.got_medicine,
      });

      achievementsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = game.get_game_time();
    }
  }

  /**
   * todo: Description.
   * todo: Move to optional exception.
   */
  protected updateMutantHunterAchievementSpawn(): void {
    if (!hasInfoPortion(infoPortions.mutant_hunter_achievement_gained)) {
      return;
    } else if (!achievementsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT) {
      achievementsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = game.get_game_time();
    }

    if (
      game.get_game_time().diffSec(achievementsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT) >
      achievementsConfig.ACHIEVEMENT_REWARD_SPAWN_PERIOD
    ) {
      spawnItemsForObjectFromList(
        registry.simulator.object(getObjectIdByStoryId(achievementsConfig.REWARD_BOXES.JUPITER)!)!,
        achievementsConfig.REWARD_ITEMS[EAchievement.MUTANT_HUNTER],
        5
      );

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_mutant_hunter_news",
        senderId: notificationsIcons.got_ammo,
      });

      achievementsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = game.get_game_time();
    }
  }

  public override save(packet: NetPacket): void {
    if (achievementsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeTimeToPacket(packet, achievementsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT);
    }

    if (achievementsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT === null) {
      packet.w_bool(false);
    } else {
      packet.w_bool(true);
      writeTimeToPacket(packet, achievementsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT);
    }
  }

  public override load(reader: NetProcessor): void {
    const hasSpawnedDetectiveLoot: boolean = reader.r_bool();

    if (hasSpawnedDetectiveLoot) {
      achievementsConfig.LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT = readTimeFromPacket(reader);
    }

    const hasSpawnedMutantHunterLoot: boolean = reader.r_bool();

    if (hasSpawnedMutantHunterLoot) {
      achievementsConfig.LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT = readTimeFromPacket(reader);
    }
  }
}
