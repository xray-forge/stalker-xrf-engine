import { stalker_ids } from "xray16";

/**
 * Evaluators IDs of GOAP motivation planner.
 */
export enum EEvaluatorId {
  /**
   * Default C++ side defined evaluators:
   */
  ALIVE = stalker_ids.property_alive, // 0
  DEAD = stalker_ids.property_dead, // 1
  ALREADY_DEAD = stalker_ids.property_already_dead, // 2
  ALIFE = stalker_ids.property_alife, // 3
  PUZZLE_SOLVED = stalker_ids.property_puzzle_solved, // 4
  SMART_TERRAIN_TASK = stalker_ids.property_smart_terrain_task, // 5
  ITEMS = stalker_ids.property_items, // 6
  ENEMY = stalker_ids.property_enemy, // 7
  DANGER = stalker_ids.property_danger, // 8
  ITEM_TO_KILL = stalker_ids.property_item_to_kill, // 9
  FOUND_ITEM_TO_KILL = stalker_ids.property_found_item_to_kill, // 10
  ITEM_CAN_KILL = stalker_ids.property_item_can_kill, // 11
  FOUND_AMMO = stalker_ids.property_found_ammo, // 12
  READY_TO_KILL = stalker_ids.property_ready_to_kill, // 13
  READY_TO_DETOUR = stalker_ids.property_ready_to_detour, // 14
  SEE_ENEMY = stalker_ids.property_see_enemy, // 15
  // ...
  PANIC = stalker_ids.property_panic, // 17
  IN_COVER = stalker_ids.property_in_cover, // 18
  LOOK_OUT = stalker_ids.property_looked_out, // 19
  POSITION_HOLD = stalker_ids.property_position_holded, // 20
  ENEMY_DETOURED = stalker_ids.property_enemy_detoured, // 21
  USE_SUDDENNESS = stalker_ids.property_use_suddenness, // 22
  PURE_ENEMY = stalker_ids.property_pure_enemy, // 23
  USE_CROUCH_TO_LOOK_OUT = stalker_ids.property_use_crouch_to_look_out, // 24
  // ...
  CRITICALLY_WOUNDED = stalker_ids.property_critically_wounded, // 29
  ENEMY_CRITICALLY_WOUNDED = stalker_ids.property_enemy_critically_wounded, // 30
  // ...
  DANGER_UNKNOWN = stalker_ids.property_danger_unknown, // 38
  DANGER_IN_DIRECTION = stalker_ids.property_danger_in_direction, // 39
  DANGER_GRENADE = stalker_ids.property_danger_grenade, // 40
  DANGER_BY_SOUND = stalker_ids.property_danger_by_sound, // 41
  COVER_ACTUAL = stalker_ids.property_cover_actual, // 42
  COVER_REACHED = stalker_ids.property_cover_reached, // 43
  LOOKED_AROUND = stalker_ids.property_looked_around, // 44
  GRENADE_EXPLODED = stalker_ids.property_grenade_exploded, // 45
  ANOMALY = stalker_ids.property_anomaly, // 46
  INSIDE_ANONALY = stalker_ids.property_inside_anomaly, // 47
  // ...
  SCRIPT = stalker_ids.property_script, // 74
  // ...
  /**
   * Custom LUA scripts defined evaluators:
   */
  // Whether any corpse to loot exists nearby.
  IS_CORPSE_EXISTING = 124, // 124
  // Whether any wounded stalker to help exists nearby.
  IS_WOUNDED_EXISTING = 129, // 129
  IS_STATE_IDLE_COMBAT = 175, // 175
  IS_STATE_IDLE_ALIFE = 176, // 176
  IS_STATE_LOGIC_ACTIVE = 178, // 178
  IS_STATE_IDLE_ITEMS = 179, // 179
  // Check if smart cover scheme is active and should go in cover.
  IS_SMART_COVER_NEEDED = 475, // 475
  // Check if combat smart cover is needed and should go in cover for fighting cover.
  CAN_USE_SMART_COVER_IN_COMBAT = 476, // 476
  IS_ANIMPOINT_NEEDED = 575, // 575
  IS_ANIMPOINT_REACHED = 576, // 576
  IS_MEET_CONTACT = 1105, // 1105
  NEED_COVER = 1145, // 1145
  IS_CAMPING_ENDED = 1155, // 1155
  IS_CLOSE_COMBAT = 1156, // 1156
  IS_SCRIPTED_COMBAT = 1184, // 1184
  IS_ABUSED = 1194, // 1194
  // Whether object is wounded and cannot fight, lay and wait for help.
  IS_WOUNDED = 2084, // 2084
  CAN_FIGHT = 2085, // 2085
  IS_PATROL_ENDED = 2324, // 2324
  IS_PATROL_COMMANDER = 2325, // 2325
  IS_COMBAT_ZOMBIED_ENABLED = 3184, // 3184
  IS_COMBAT_CAMPING_ENABLED = 3204, // 3204
  SEE_BEST_ENEMY = 3205, // 3205
  NEED_SLEEPER = 4265, // 4265
  NEED_WALKER = 4445, // 4445
  NEED_REMARK = 4595, // 4595
  NEED_COMPANION = 4625, // 4625
}
