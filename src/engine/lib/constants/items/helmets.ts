/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * List of available helmets items sections.
 */
export const helmets = {
  helm_battle: "helm_battle",
  helm_hardhat: "helm_hardhat",
  helm_hardhat_snag: "helm_hardhat_snag",
  helm_protective: "helm_protective",
  helm_respirator: "helm_respirator",
  helm_respirator_joker: "helm_respirator_joker",
  helm_tactic: "helm_tactic",
} as const;

/**
 * Type definition of available helmets items sections.
 */
export type THelmets = typeof helmets;

/**
 * Type definition of single helmet item section.
 */
export type THelmet = THelmets[keyof THelmets];
