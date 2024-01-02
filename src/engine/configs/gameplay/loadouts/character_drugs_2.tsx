import { JSXNode } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils";
import { drugs } from "@/engine/lib/constants/items/drugs";

export const comment: string = "";

export const defaultCharacterDrugs2: Array<ILoadoutItemDescriptor> = [
  { section: drugs.medkit, probability: 0.2 },
  { section: drugs.bandage, probability: 0.4 },
  { section: drugs.antirad, probability: 0.1 },
  { section: drugs.drug_booster, probability: 0.06 },
  { section: drugs.drug_coagulant, probability: 0.06 },
];

export function create(): JSXNode {
  return createLoadout(defaultCharacterDrugs2);
}
