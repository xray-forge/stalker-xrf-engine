import { Time } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { TInventoryItem } from "@/engine/constants/items";
import { ammo } from "@/engine/constants/items/ammo";
import { drugs } from "@/engine/constants/items/drugs";
import { storyNames } from "@/engine/constants/story_names";
import { EAchievement } from "@/engine/core/utils/achievements/achievements_types";

export const achievementRewardsConfig = {
  LAST_DETECTIVE_ACHIEVEMENT_SPAWN_AT: null as Nillable<Time>,
  LAST_MUTANT_HUNTER_ACHIEVEMENT_SPAWN_AT: null as Nillable<Time>,
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
