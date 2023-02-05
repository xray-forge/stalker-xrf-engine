/* eslint sort-keys-fix/sort-keys-fix: "error" */

export const helmets = {
  helm_battle: "helm_battle",
  helm_hardhat: "helm_hardhat",
  helm_hardhat_snag: "helm_hardhat_snag",
  helm_protective: "helm_protective",
  helm_respirator: "helm_respirator",
  helm_respirator_joker: "helm_respirator_joker",
  helm_tactic: "helm_tactic",
} as const;

export type THelmets = typeof helmets;

export type THelmet = THelmets[keyof THelmets];
