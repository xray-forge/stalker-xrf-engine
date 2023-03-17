import { TAmmoItem, TAmmoItems } from "@/engine/globals/items/ammo";
import { TArtefact, TArtefacts } from "@/engine/globals/items/artefacts";
import { TDetector, TDetectors } from "@/engine/globals/items/detectors";
import { TDrugItem, TDrugItems } from "@/engine/globals/items/drugs";
import { TFoodItem, TFoodItems } from "@/engine/globals/items/food";
import { THelmet, THelmets } from "@/engine/globals/items/helmets";
import { TInventoryObject, TInventoryObjects } from "@/engine/globals/items/inventory_objects";
import { TOutfit, TOutfits } from "@/engine/globals/items/outfits";
import { TWeaponAddon, TWeaponAddons } from "@/engine/globals/items/weapon_addons";
import { TWeapon, TWeapons } from "@/engine/globals/items/weapons";

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
  | TWeapons;

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
  | TWeapon;
