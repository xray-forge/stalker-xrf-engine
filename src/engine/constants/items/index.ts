import { TAmmoItem } from "@/engine/constants/items/ammo";
import { TArtefact } from "@/engine/constants/items/artefacts";
import { TDetector } from "@/engine/constants/items/detectors";
import { TDrugItem } from "@/engine/constants/items/drugs";
import { TFoodItem } from "@/engine/constants/items/food";
import { THelmet } from "@/engine/constants/items/helmets";
import { TOutfit } from "@/engine/constants/items/outfits";
import { TQuestItem } from "@/engine/constants/items/quest_items";
import { TWeapon, TWeaponAddon } from "@/engine/constants/items/weapons";

/**
 * Type definition of possible item section.
 */
export type TInventoryItem =
  TAmmoItem | TArtefact | TDetector | TDrugItem | TFoodItem | THelmet | TOutfit | TWeaponAddon | TWeapon | TQuestItem;
