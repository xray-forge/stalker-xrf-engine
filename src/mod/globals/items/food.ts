/* eslint sort-keys-fix/sort-keys-fix: "error" */

export const food = {
  bread: "bread",
  conserva: "conserva",
  energy_drink: "energy_drink",
  kolbasa: "kolbasa",
  vodka: "vodka"
} as const;

export type TFoodItems = typeof food;

export type TFoodItem = TFoodItems[keyof TFoodItems];
