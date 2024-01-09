import { ISpawnItemDescriptor } from "@/engine/configs/gameplay/utils";
import { food } from "@/engine/lib/constants/items/food";

/**
 * Generic character food.
 * Includes vodka item with some chance.
 */
export function loadoutCharacterFood(): Array<ISpawnItemDescriptor> {
  return [
    { section: food.bread, probability: 0.5 },
    { section: food.kolbasa, probability: 0.5 },
    { section: food.vodka, probability: 0.5 },
  ];
}

/**
 * Generic character food.
 * Excludes alcohol.
 */
export function loadoutCharacterFoodWithoutAlcohol(): Array<ISpawnItemDescriptor> {
  return [
    { section: food.bread, probability: 0.5 },
    { section: food.kolbasa, probability: 0.5 },
    { section: food.conserva, probability: 0.5 },
  ];
}
