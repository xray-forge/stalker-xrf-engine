import { game } from "xray16";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
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
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationType, ITipNotification, notificationsIcons } from "@/engine/core/managers/notifications";
import { abort } from "@/engine/core/utils/assertion";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/game/game_time";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObjectFromList } from "@/engine/core/utils/object/object_spawn";
import { infoPortions } from "@/engine/lib/constants/info_portions/info_portions";
import { NetPacket, NetProcessor, Optional, Time } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: move to config file generic achievements descriptions
 */
export class AchievementsManager extends AbstractManager {
  public lastDetectiveAchievementSpawnTime: Optional<Time> = null;
  public lastMutantHunterAchievementSpawnTime: Optional<Time> = null;

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
  }

  public override update(): void {
    this.updateDetectiveAchievementRewardSpawn();
    this.updateMutantHunterAchievementSpawn();
  }

  /**
   * todo: Description.
   * todo: create map for matching instead of switch/ifs
   */
  public checkAchieved(achievement: EAchievement): boolean {
    switch (achievement) {
      case EAchievement.PIONEER:
        return hasAchievedPioneer();
      case EAchievement.MUTANT_HUNTER:
        return hasAchievedMutantHunter();
      case EAchievement.DETECTIVE:
        return hasAchievedDetective();
      case EAchievement.ONE_OF_THE_LADS:
        return hasAchievedOneOfLads();
      case EAchievement.KINGPIN:
        return hasAchievedKingpin();
      case EAchievement.HERALD_OF_JUSTICE:
        return hasAchievedHeraldOfJustice();
      case EAchievement.SEEKER:
        return hasAchievedSeeker();
      case EAchievement.BATTLE_SYSTEMS_MASTER:
        return hasAchievedBattleSystemsMaster();
      case EAchievement.HIGH_TECH_MASTER:
        return hasAchievedHighTechMaster();
      case EAchievement.SKILLED_STALKER:
        return hasAchievedSkilledStalker();
      case EAchievement.LEADER:
        return hasAchievedLeader();
      case EAchievement.DIPLOMAT:
        return hasAchievedDiplomat();
      case EAchievement.RESEARCH_MAN:
        return hasAchievedResearchMan();
      case EAchievement.FRIEND_OF_DUTY:
        return hasAchievedFriendOfDuty();
      case EAchievement.FRIEND_OF_FREEDOM:
        return hasAchievedFriendOfFreedom();
      case EAchievement.BALANCE_ADVOCATE:
        return hasAchievedBalanceAdvocate();
      case EAchievement.WEALTHY:
        return hasAchievedWealthy();
      case EAchievement.KEEPER_OF_SECRETS:
        return hasAchievedKeeperOfSecrets();
      case EAchievement.MARKED_BY_ZONE:
        return hasAchievedMarkedByZone();
      case EAchievement.INFORMATION_DEALER:
        return hasAchievedInformationDealer();
      case EAchievement.FRIEND_OF_STALKERS:
        return hasAchievedFriendOfStalkers();
      default:
        abort("Trying to check not existing achievement status: '%s'.", achievement);
    }
  }

  /**
   * todo: Description.
   */
  protected updateDetectiveAchievementRewardSpawn(): void {
    if (!hasAlifeInfo(infoPortions.detective_achievement_gained)) {
      return;
    } else if (!this.lastDetectiveAchievementSpawnTime) {
      this.lastDetectiveAchievementSpawnTime = game.get_game_time();
    }

    if (
      game.get_game_time().diffSec(this.lastDetectiveAchievementSpawnTime) >
      achievementRewards.ACHIEVEMENT_REWARD_SPAWN_PERIOD
    ) {
      spawnItemsForObjectFromList(
        registry.simulator.object(getObjectIdByStoryId(achievementRewards.REWARD_BOXES.ZATON)!)!,
        achievementRewards.ITEMS[EAchievement.DETECTIVE],
        4
      );

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_detective_news",
        senderId: notificationsIcons.got_medicine,
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
    } else if (!this.lastMutantHunterAchievementSpawnTime) {
      this.lastMutantHunterAchievementSpawnTime = game.get_game_time();
    }

    if (
      game.get_game_time().diffSec(this.lastMutantHunterAchievementSpawnTime) >
      achievementRewards.ACHIEVEMENT_REWARD_SPAWN_PERIOD
    ) {
      spawnItemsForObjectFromList(
        registry.simulator.object(getObjectIdByStoryId(achievementRewards.REWARD_BOXES.JUPITER)!)!,
        achievementRewards.ITEMS[EAchievement.MUTANT_HUNTER],
        5
      );

      EventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
        type: ENotificationType.TIP,
        caption: "st_mutant_hunter_news",
        senderId: notificationsIcons.got_ammo,
      });

      this.lastMutantHunterAchievementSpawnTime = game.get_game_time();
    }
  }

  public override save(packet: NetPacket): void {
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

  public override load(reader: NetProcessor): void {
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
