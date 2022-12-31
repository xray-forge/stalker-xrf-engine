/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const communities = {
  army: "army",
  bandit: "bandit",
  dolg: "dolg",
  duty: "duty",
  ecolog: "ecolog",
  freedom: "freedom",
  killer: "killer",
  monolith: "monolith",
  monster: "monster",
  monster_predatory_day: "monster_predatory_day",
  monster_predatory_night: "monster_predatory_night",
  monster_special: "monster_special",
  monster_vegetarian: "monster_vegetarian",
  monster_zombied_day: "monster_zombied_day",
  monster_zombied_night: "monster_zombied_night",
  stalker: "stalker",
  zombied: "zombied"
} as const;

export type TCommunities = typeof communities;

export type TCommunity = TCommunities[keyof TCommunities];
