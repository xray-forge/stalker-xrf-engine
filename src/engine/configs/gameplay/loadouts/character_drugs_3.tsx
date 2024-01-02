import { JSXNode } from "jsx-xml";

import { createLoadout } from "@/engine/configs/gameplay/utils";
import { drugs } from "@/engine/lib/constants/items/drugs";

export const comment: string = "";

export function create(): JSXNode {
  return createLoadout([
    { section: drugs.medkit, probability: 0.3 },
    { section: drugs.bandage, probability: 0.5 },
    { section: drugs.antirad, probability: 0.2 },
    { section: drugs.drug_booster, probability: 0.08 },
    { section: drugs.drug_coagulant, probability: 0.08 },
    { section: drugs.drug_antidot, probability: 0.06 },
    { section: drugs.drug_radioprotector, probability: 0.06 },
  ]);
}
