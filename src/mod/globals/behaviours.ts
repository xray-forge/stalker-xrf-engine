import { communities, TCommunity } from "@/mod/globals/communities";
import { PartialRecord } from "@/mod/lib/types";

export const squadCommunityByBehaviour: Record<TCommunity, TCommunity> = {
  [communities.stalker]: communities.stalker,
  [communities.bandit]: communities.bandit,
  [communities.duty]: communities.dolg,
  [communities.dolg]: communities.dolg,
  [communities.freedom]: communities.freedom,
  [communities.army]: communities.army,
  [communities.ecolog]: communities.ecolog,
  [communities.killer]: communities.killer,
  [communities.zombied]: communities.zombied,
  [communities.monolith]: communities.monolith,
  [communities.monster]: communities.monster,
  [communities.monster_predatory_day]: communities.monster,
  [communities.monster_predatory_night]: communities.monster,
  [communities.monster_vegetarian]: communities.monster,
  [communities.monster_zombied_day]: communities.monster,
  [communities.monster_zombied_night]: communities.monster,
  [communities.monster_special]: communities.monster
};

export const squadMonsters: PartialRecord<TCommunity, boolean> = {
  [communities.monster_predatory_day]: true,
  [communities.monster_predatory_night]: true,
  [communities.monster_vegetarian]: true,
  [communities.monster_zombied_day]: true,
  [communities.monster_zombied_night]: true,
  [communities.monster_special]: true,
  [communities.monster]: true
};
