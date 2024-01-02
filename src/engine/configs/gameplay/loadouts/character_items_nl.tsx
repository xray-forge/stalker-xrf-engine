import { JSXNode } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { misc } from "@/engine/lib/constants/items/misc";
import { weapons } from "@/engine/lib/constants/items/weapons";

export const comment: string = "";

export const defaultCharacterItemsWithoutTorch: Array<ILoadoutItemDescriptor> = [
  { section: misc.guitar_a },
  { section: misc.harmonica_a },
  { section: detectors.detector_simple, probability: 0.35 },
  { section: weapons.wpn_binoc },
];

export function create(): JSXNode {
  return createLoadout(defaultCharacterItemsWithoutTorch);
}
