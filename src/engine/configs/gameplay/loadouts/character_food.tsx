import { JSXNode } from "jsx-xml";

import { createLoadout } from "@/engine/configs/gameplay/utils";
import { food } from "@/engine/lib/constants/items/food";

export const comment: string = "";

export function create(): JSXNode {
  return createLoadout([
    { section: food.bread, probability: 0.5 },
    { section: food.kolbasa, probability: 0.5 },
    { section: food.vodka, probability: 0.5 },
  ]);
}
