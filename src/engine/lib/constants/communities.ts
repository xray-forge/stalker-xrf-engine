/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
 */
export const stalkerCommunities = {
  army: "army",
  bandit: "bandit",
  dolg: "dolg",
  ecolog: "ecolog",
  freedom: "freedom",
  killer: "killer",
  monolith: "monolith",
  stalker: "stalker",
  zombied: "zombied",
} as const;

/**
 * todo;
 */
export const monsterCommunities = {
  monster: "monster",
  monster_predatory_day: "monster_predatory_day",
  monster_predatory_night: "monster_predatory_night",
  monster_special: "monster_special",
  monster_vegetarian: "monster_vegetarian",
  monster_zombied_day: "monster_zombied_day",
  monster_zombied_night: "monster_zombied_night",
} as const;

/**
 * todo;
 */
export const communities = {
  ...stalkerCommunities,
  ...monsterCommunities,
  actor: "actor",
  none: "none",
} as const;

/**
 * todo;
 */
export type TCommunities = typeof communities;

/**
 * todo;
 */
export type TCommunity = TCommunities[keyof TCommunities];
