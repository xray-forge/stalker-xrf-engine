import { JSXNode } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils";
import { drugs } from "@/engine/lib/constants/items/drugs";

export const comment: string = "";

export const defaultCharacterDrugs4: Array<ILoadoutItemDescriptor> = [
  { section: drugs.medkit, probability: 0.4 },
  { section: drugs.bandage, probability: 0.6 },
  { section: drugs.antirad, probability: 0.3 },
  { section: drugs.drug_booster, probability: 0.1 },
  { section: drugs.drug_coagulant, probability: 0.1 },
  { section: drugs.drug_antidot, probability: 0.08 },
  { section: drugs.drug_radioprotector, probability: 0.08 },
  { section: drugs.drug_psy_blockade, probability: 0.04 },
  { section: drugs.drug_anabiotic, probability: 0.005 },
];

export function create(): JSXNode {
  return createLoadout(defaultCharacterDrugs4);
}
