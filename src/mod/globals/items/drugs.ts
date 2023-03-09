/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
 */
export const medkits = {
  medkit: "medkit",
  medkit_army: "medkit_army",
  medkit_scientic: "medkit_scientic",
} as const;

/**
 * todo;
 */
export type TMedkits = typeof medkits;

/**
 * todo;
 */
export type TMedkit = TMedkits[keyof TMedkits];

/**
 * todo;
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
 * todo;
 */
export type TDrugItems = typeof drugs;

/**
 * todo;
 */
export type TDrugItem = TDrugItems[keyof TDrugItems];
