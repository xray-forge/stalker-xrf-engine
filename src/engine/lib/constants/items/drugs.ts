/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * List of medkits sections.
 */
export const medkits = {
  medkit: "medkit",
  medkit_army: "medkit_army",
  medkit_scientic: "medkit_scientic",
} as const;

/**
 * Type definition of medkits list.
 */
export type TMedkits = typeof medkits;

/**
 * Type definition of single medkit section available in game.
 */
export type TMedkit = TMedkits[keyof TMedkits];

/**
 * List of drug sections available in game.
 */
export const drugs = {
  ...medkits,
  antirad: "antirad",
  bandage: "bandage",
  drug_anabiotic: "drug_anabiotic",
  drug_antidot: "drug_antidot",
  drug_booster: "drug_booster",
  drug_coagulant: "drug_coagulant",
  drug_psy_blockade: "drug_psy_blockade",
  drug_radioprotector: "drug_radioprotector",
} as const;

/**
 * Type definition of ddrugs sections list.
 */
export type TDrugItems = typeof drugs;

/**
 * Type definition of single drug section item available in game.
 */
export type TDrugItem = TDrugItems[keyof TDrugItems];
