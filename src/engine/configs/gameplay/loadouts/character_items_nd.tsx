import { JSXNode } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils";
import { misc } from "@/engine/lib/constants/items/misc";
import { weapons } from "@/engine/lib/constants/items/weapons";

export const comment: string = "";

export const defaultCharacterItemsWithoutDetector: Array<ILoadoutItemDescriptor> = [
  { section: misc.guitar_a },
  { section: misc.harmonica_a },
  { section: misc.device_torch },
  { section: weapons.wpn_binoc },
];

export function create(): JSXNode {
  return createLoadout(defaultCharacterItemsWithoutDetector);
}
