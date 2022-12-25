/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const npc_map_marks = {
  ui_pda2_actor_sleep_location: "ui_pda2_actor_sleep_location",
  ui_pda2_mechanic_location: "ui_pda2_mechanic_location",
  ui_pda2_medic_location: "ui_pda2_medic_location",
  ui_pda2_quest_npc_location: "ui_pda2_quest_npc_location",
  ui_pda2_scout_location: "ui_pda2_scout_location",
  ui_pda2_trader_location: "ui_pda2_trader_location"
};

export const map_mark_type = {
  guider: "guider",
  mechanic: "mechanic",
  medic: "medic",
  quest_npc: "quest_npc",
  trader: "trader"
};

export type TMapMarks = typeof map_mark_type;

export type TMapMark = TMapMarks[keyof TMapMarks];
