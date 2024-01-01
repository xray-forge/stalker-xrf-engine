import { JSXNode } from "jsx-xml";

import { createLoadout } from "@/engine/configs/gameplay/utils";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { misc } from "@/engine/lib/constants/items/misc";
import { weapons } from "@/engine/lib/constants/items/weapons";

export const comment: string = "";

export function create(): JSXNode {
  return createLoadout([
    { section: misc.guitar_a },
    { section: misc.harmonica_a },
    { section: weapons.wpn_binoc },
    { section: detectors.detector_elite, probability: 0.25 },
  ]);
}
