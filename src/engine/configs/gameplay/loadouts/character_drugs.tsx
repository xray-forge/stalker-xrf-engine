import { JSXNode } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils";
import { drugs } from "@/engine/lib/constants/items/drugs";

export const comment: string = "";

export const defaultCharacterDrugs: Array<ILoadoutItemDescriptor> = [
  { section: drugs.medkit, probability: 0.2 },
  { section: drugs.bandage, probability: 0.4 },
];

export function create(): JSXNode {
  return createLoadout(defaultCharacterDrugs);
}
