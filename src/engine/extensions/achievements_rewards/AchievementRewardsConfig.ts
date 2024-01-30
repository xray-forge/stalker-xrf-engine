import { EAchievement } from "@/engine/core/utils/achievements/achievements_types";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { storyNames } from "@/engine/lib/constants/story_names";
import { Optional, Time } from "@/engine/lib/types";

export const achievementRewardsConfig = {
  LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT: null as Optional<Time>,
  LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT: null as Optional<Time>,
  ACHIEVEMENT_REWARD_SPAWN_PERIOD: 12 * 60 * 60,
  /**
   * For seeker require at least 22 unique artefacts to be found.
   */
  REWARD_BOXES: {
    JUPITER: storyNames.jup_b202_actor_treasure,
    ZATON: storyNames.zat_a2_actor_treasure,
  },
  REWARD_ITEMS: {
    [EAchievement.MUTANT_HUNTER]: $fromArray<TInventoryItem>([
      ammo["ammo_5.45x39_ap"],
      ammo["ammo_5.56x45_ap"],
      ammo.ammo_9x39_ap,
      ammo["ammo_5.56x45_ap"],
      ammo.ammo_12x76_zhekan,
    ]),
    [EAchievement.DETECTIVE]: $fromArray<TInventoryItem>([drugs.medkit, drugs.antirad, drugs.antirad]),
  },
};
