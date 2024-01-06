import { JSXNode } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils";
import { drugs } from "@/engine/lib/constants/items/drugs";

export const comment: string = "";

export const defaultCharacterDrugsMilitary: Array<ILoadoutItemDescriptor> = [
  { section: drugs.medkit_army, probability: 0.2 },
];

export function create(): JSXNode {
  return createLoadout(defaultCharacterDrugsMilitary);
}