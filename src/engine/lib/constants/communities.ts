/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * List of available stalkers game communities.
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
 * List of available monsters game communities.
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
 * List of all available game communities.
 */
export const communities = {
  ...stalkerCommunities,
  ...monsterCommunities,
  actor: "actor",
  none: "none",
} as const;

/**
 * Communities list type definitions.
 */
export type TCommunities = typeof communities;

/**
 * Single community type definition.
 */
export type TCommunity = TCommunities[keyof TCommunities];
