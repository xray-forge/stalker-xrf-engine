/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
 */
export const mapMarks = {
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
export enum EMapMarkType {
  GUIDER = "guider",
  MECHANIC = "mechanic",
  MEDIC = "medic",
  QUEST_NPC = "quest_npc",
  TRADER = "trader",
}
