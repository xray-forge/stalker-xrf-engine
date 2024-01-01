import { JSXNode } from "jsx-xml";

import { createLoadout } from "@/engine/configs/gameplay/utils";
import { drugs } from "@/engine/lib/constants/items/drugs";

export const comment: string = "";

export function create(): JSXNode {
  return createLoadout([{ section: drugs.medkit_scientic, probability: 0.2 }]);
}
