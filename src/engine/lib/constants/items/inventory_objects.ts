/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
 */
export const inventory_objects = {
  inventory_box_s: "inventory_box_s",
  obj_antirad: "obj_antirad",
  obj_antirad_s: "obj_antirad_s",
  obj_attachable: "obj_attachable",
  obj_bandage: "obj_bandage",
  obj_bandage_s: "obj_bandage_s",
  obj_bolt: "obj_bolt",
  obj_bottle: "obj_bottle",
  obj_bottle_s: "obj_bottle_s",
  obj_breakable: "obj_breakable",
  obj_climable: "obj_climable",
  obj_document: "obj_document",
  obj_explosive: "obj_explosive",
  obj_explosive_s: "obj_explosive_s",
  obj_food: "obj_food",
  obj_food_s: "obj_food_s",
  obj_medkit: "obj_medkit",
  obj_medkit_s: "obj_medkit_s",
  obj_pda_s: "obj_pda_s",
} as const;

/**
 * todo;
 */
export type TInventoryObjects = typeof inventory_objects;

/**
 * todo;
 */
export type TInventoryObject = TInventoryObjects[keyof TInventoryObjects];
