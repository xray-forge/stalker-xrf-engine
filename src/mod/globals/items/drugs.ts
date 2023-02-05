/* eslint sort-keys-fix/sort-keys-fix: "error" */

export const drugs = {
  antirad: "antirad",
  bandage: "bandage",
  drug_anabiotic: "drug_anabiotic",
  drug_antidot: "drug_antidot",
  drug_booster: "drug_booster",
  drug_coagulant: "drug_coagulant",
  drug_psy_blockade: "drug_psy_blockade",
  drug_radioprotector: "drug_radioprotector",
  medkit: "medkit",
  medkit_army: "medkit_army",
  medkit_scientic: "medkit_scientic",
} as const;

export type TDrugItems = typeof drugs;

export type TDrugItem = TDrugItems[keyof TDrugItems];
