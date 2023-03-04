/* eslint sort-keys-fix/sort-keys-fix: "error"*/

/**
 * todo;
 */
export const npc_map_marks = {
  ui_pda2_actor_sleep_location: "ui_pda2_actor_sleep_location",
  ui_pda2_mechanic_location: "ui_pda2_mechanic_location",
  ui_pda2_medic_location: "ui_pda2_medic_location",
  ui_pda2_quest_npc_location: "ui_pda2_quest_npc_location",
  ui_pda2_scout_location: "ui_pda2_scout_location",
  ui_pda2_trader_location: "ui_pda2_trader_location",
} as const;

/**
 * todo;
 */
export const map_mark_type = {
  guider: "guider",
  mechanic: "mechanic",
  medic: "medic",
  quest_npc: "quest_npc",
  trader: "trader",
} as const;

/**
 * todo;
 */
export type TMapMarks = typeof map_mark_type;

/**
 * todo;
 */
export type TMapMark = TMapMarks[keyof TMapMarks];
