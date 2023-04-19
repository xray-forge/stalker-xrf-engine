import { EAchievement } from "@/engine/core/managers/interaction/achievements/types";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { storyNames } from "@/engine/lib/constants/story_names";

/**
 * todo;
 */
export const achievementRewards = {
  ACHIEVEMENT_REWARD_SPAWN_PERIOD: 43_200,
  REWARD_BOXES: {
    JUPITER: storyNames.jup_b202_actor_treasure,
    ZATON: storyNames.zat_a2_actor_treasure,
  },
  ITEMS: {
    [EAchievement.MUTANT_HUNTER]: $fromArray<TInventoryItem>([
      ammo["ammo_5.45x39_ap"],
      ammo["ammo_5.56x45_ap"],
      ammo.ammo_9x39_ap,
      ammo["ammo_5.56x45_ap"],
      ammo.ammo_12x76_zhekan,
    ]),
    [EAchievement.DETECTIVE]: $fromArray<TInventoryItem>([drugs.medkit, drugs.antirad, drugs.antirad]),
  },
} as const;
