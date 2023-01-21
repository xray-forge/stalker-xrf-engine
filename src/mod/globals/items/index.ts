import { TAmmoItem, TAmmoItems } from "@/mod/globals/items/ammo";
import { TArtefact, TArtefacts } from "@/mod/globals/items/artefacts";
import { TDetector, TDetectors } from "@/mod/globals/items/detectors";
import { TDrugItem, TDrugItems } from "@/mod/globals/items/drugs";
import { TFoodItem, TFoodItems } from "@/mod/globals/items/food";
import { THelmet, THelmets } from "@/mod/globals/items/helmets";
import { TInventoryObject, TInventoryObjects } from "@/mod/globals/items/inventory_objects";
import { TOutfit, TOutfits } from "@/mod/globals/items/outfits";
import { TWeaponAddon, TWeaponAddons } from "@/mod/globals/items/weapon_addons";
import { TWeapon, TWeapons } from "@/mod/globals/items/weapons";

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
