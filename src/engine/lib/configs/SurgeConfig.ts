import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { PartialRecord } from "@/engine/lib/types";

export const surgeConfig = {
  DURATION: 190,
  INTERVAL_BETWEEN_SURGES: {
    MIN: 12 * 60 * 60,
    MAX: 24 * 60 * 60,
    MIN_ON_FIRST_TIME: 2 * 60 * 60,
    MAX_ON_FIRST_TIME: 4 * 60 * 60,
    POST_TF_DELAY_MIN: 1 * 60 * 60,
    POST_TF_DELAY_MAX: 3 * 60 * 60,
  },
  IMMUNE_SQUDS: {
    [communities.monster_predatory_day]: true,
    [communities.monster_predatory_night]: true,
    [communities.monster_vegetarian]: true,
    [communities.monster_zombied_day]: true,
    [communities.monster_zombied_night]: true,
    [communities.monster_special]: true,
    [communities.monster]: true,
    [communities.zombied]: true,
  } as PartialRecord<TCommunity, boolean>,
  SURGE_DISABLED_LEVELS: {
    [levels.labx8]: true,
    [levels.jupiter_underground]: true,
  } as PartialRecord<TLevel, boolean>,
};
