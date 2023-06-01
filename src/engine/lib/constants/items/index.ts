import { TAmmoItem, TAmmoItems } from "@/engine/lib/constants/items/ammo";
import { TArtefact, TArtefacts } from "@/engine/lib/constants/items/artefacts";
import { TDetector, TDetectors } from "@/engine/lib/constants/items/detectors";
import { TDrugItem, TDrugItems } from "@/engine/lib/constants/items/drugs";
import { TFoodItem, TFoodItems } from "@/engine/lib/constants/items/food";
import { THelmet, THelmets } from "@/engine/lib/constants/items/helmets";
import { TInventoryObject, TInventoryObjects } from "@/engine/lib/constants/items/inventory_objects";
import { TOutfit, TOutfits } from "@/engine/lib/constants/items/outfits";
import { TQuestItem, TQuestItems } from "@/engine/lib/constants/items/quest_items";
import { TWeaponAddon, TWeaponAddons } from "@/engine/lib/constants/items/weapon_addons";
import { TWeapon, TWeapons } from "@/engine/lib/constants/items/weapons";

/**
 * todo;
 */
export type TInventoryItems =
  | TAmmoItems
  | TArtefacts
  | TDetectors
  | TDrugItems
  | TFoodItems
  | THelmets
  | TInventoryObjects
  | TOutfits
  | TWeaponAddons
  | TWeapons
  | TQuestItems;

/**
 * todo;
 */
export type TInventoryItem =
  | TAmmoItem
  | TArtefact
  | TDetector
  | TDrugItem
  | TFoodItem
  | THelmet
  | TInventoryObject
  | TOutfit
  | TWeaponAddon
  | TWeapon
  | TQuestItem;
