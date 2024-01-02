import { JSXNode } from "jsx-xml";

import { createLoadout, ILoadoutItemDescriptor } from "@/engine/configs/gameplay/utils";
import { weapons } from "@/engine/lib/constants/items/weapons";

export const comment: string = "";

export const defaultCharacterSellWeapons: Array<ILoadoutItemDescriptor> = [
  { section: weapons.wpn_pm, probability: 0.02 },
  { section: weapons.wpn_pb, probability: 0.02 },
  { section: weapons.wpn_fort, probability: 0.02 },
  { section: weapons.wpn_ak74, probability: 0.02 },
  { section: weapons.wpn_ak74u, probability: 0.02 },
  { section: weapons.wpn_bm16, probability: 0.02 },
  { section: weapons.wpn_toz34, probability: 0.02 },
  { section: weapons.wpn_wincheaster1300, probability: 0.02 },
  { section: weapons.wpn_l85, probability: 0.02 },
  { section: weapons.wpn_mp5, probability: 0.02 },
];

export function create(): JSXNode {
  return createLoadout(defaultCharacterSellWeapons);
}
