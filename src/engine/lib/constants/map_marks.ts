/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
 */
export const mapMarks = {
  alife_presentation_squad_enemy: "alife_presentation_squad_enemy",
  alife_presentation_squad_enemy_debug: "alife_presentation_squad_enemy_debug",
  alife_presentation_squad_friend: "alife_presentation_squad_friend",
  alife_presentation_squad_friend_debug: "alife_presentation_squad_friend_debug",
  alife_presentation_squad_monster: "alife_presentation_squad_monster",
  alife_presentation_squad_monster_debug: "alife_presentation_squad_monster_debug",
  alife_presentation_squad_neutral: "alife_presentation_squad_neutral",
  alife_presentation_squad_neutral_debug: "alife_presentation_squad_neutral_debug",
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
