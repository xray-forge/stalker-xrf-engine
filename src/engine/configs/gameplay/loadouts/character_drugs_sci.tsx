import { JSXNode } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils";
import { drugs } from "@/engine/lib/constants/items/drugs";

export const comment: string = "";

export const defaultDrugsMilitary: Array<ILoadoutItemDescriptor> = [
  { section: drugs.medkit_scientic, probability: 0.2 },
];

export function create(): JSXNode {
  return createLoadout(defaultDrugsMilitary);
}
