import { communities, TCommunity } from "@/mod/globals/communities";

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

export const squadMonsters = {
  [squadCommunityByBehaviour.monster_predatory_day]: true,
  [squadCommunityByBehaviour.monster_predatory_night]: true,
  [squadCommunityByBehaviour.monster_vegetarian]: true,
  [squadCommunityByBehaviour.monster_zombied_day]: true,
  [squadCommunityByBehaviour.monster_zombied_night]: true,
  [squadCommunityByBehaviour.monster_special]: true,
  [squadCommunityByBehaviour.monster]: true
};
