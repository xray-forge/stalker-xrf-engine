/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Squad section names referenced by quest logic.
 *
 * @virtual
 */
export const squadSections = {
  zat_b29_stalker_rival_1_squad: "zat_b29_stalker_rival_1_squad",
  zat_b29_stalker_rival_2_squad: "zat_b29_stalker_rival_2_squad",
  zat_b29_stalker_rival_default_1_squad: "zat_b29_stalker_rival_default_1_squad",
  zat_b29_stalker_rival_default_2_squad: "zat_b29_stalker_rival_default_2_squad",
} as const;

export type TSquadSections = typeof squadSections;

export type TSquadSection = TSquadSections[keyof TSquadSections];
