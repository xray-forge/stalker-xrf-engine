import { TInventoryItem } from "@/engine/globals/items";
import { ammo } from "@/engine/globals/items/ammo";
import { drugs } from "@/engine/globals/items/drugs";
import { names } from "@/engine/globals/names";
import { LuaArray } from "@/engine/lib/types";
import { EAchievement } from "@/engine/scripts/core/managers/achievements/EAchievement";

/**
 * todo;
 */
export const achievementRewards = {
  ACHIEVEMENT_REWARD_SPAWN_PERIOD: 43_200,
  REWARD_BOXES: {
    JUPITER: names.jup_b202_actor_treasure,
    ZATON: names.zat_a2_actor_treasure,
  },
  ITEMS: {
    [EAchievement.MUTANT_HUNTER]: [
      ammo["ammo_5.45x39_ap"],
      ammo["ammo_5.56x45_ap"],
      ammo.ammo_9x39_ap,
      ammo["ammo_5.56x45_ap"],
      ammo.ammo_12x76_zhekan,
    ] as unknown as LuaArray<TInventoryItem>,
    [EAchievement.DETECTIVE]: [drugs.medkit, drugs.antirad, drugs.antirad] as unknown as LuaArray<TInventoryItem>,
  },
} as const;
