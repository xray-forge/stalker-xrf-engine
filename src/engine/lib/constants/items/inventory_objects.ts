/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
 */
export const inventoryObjects = {
  obj_antirad: "obj_antirad",
  obj_attachable: "obj_attachable",
  obj_bandage: "obj_bandage",
  obj_bolt: "obj_bolt",
  obj_bottle: "obj_bottle",
  obj_breakable: "obj_breakable",
  obj_climable: "obj_climable",
  obj_document: "obj_document",
  obj_explosive: "obj_explosive",
  obj_food: "obj_food",
  obj_medkit: "obj_medkit",
} as const;

/**
 * todo;
 */
export type TInventoryObjects = typeof inventoryObjects;

/**
 * todo;
 */
export type TInventoryObject = TInventoryObjects[keyof TInventoryObjects];
