import { stalker_ids } from "xray16";

/**
 * Action IDs of GOAP motivation action planner.
 */
export enum EActionId {
  /**
   * Default C++ side defined actions:
   */
  DYING = stalker_ids.action_dying, // 1
  GATHER_ITEMS = stalker_ids.action_gather_items, // 2
  NO_ALIFE = stalker_ids.action_no_alife, // 3
  SMART_TERRAIN_TASK = stalker_ids.action_smart_terrain_task, // 4
  SOLVE_ZONE_PUZZLE = stalker_ids.action_solve_zone_puzzle, // 5
  REACH_TASK_LOCATION = stalker_ids.action_reach_task_location, // 6
  ACCOMPLISH_TASK = stalker_ids.action_accomplish_task, // 7
  REACH_CUSTOMER_LOCATION = stalker_ids.action_reach_customer_location, // 8
  COMMUNICATE_WITH_CUSTOMER = stalker_ids.action_communicate_with_customer, // 9
  GET_OUT_OF_ANOMALY = stalker_ids.get_out_of_anomaly, // 10
  DETECT_ANOMALY = stalker_ids.detect_anomaly, // 11
  GET_ITEM_TO_KILL = stalker_ids.action_get_item_to_kill, // 12
  FIND_ITEM_TO_KILL = stalker_ids.action_find_item_to_kill, // 13
  MAKE_ITEM_KILLING = stalker_ids.action_make_item_killing, // 14
  FIND_AMMO = stalker_ids.action_find_ammo, // 15
  AIM_ENEMY = stalker_ids.action_aim_enemy, // 16
  GET_READY_TO_KILL = stalker_ids.action_get_ready_to_kill, // 17
  // ...
  KILL_ENEMY = stalker_ids.action_kill_enemy, // 19
  RETREAT_FROM_ENEMY = stalker_ids.action_retreat_from_enemy, // 20
  TAKE_COVER = stalker_ids.action_take_cover, // 21
  LOOK_OUT = stalker_ids.action_look_out, // 22
  HOLD_POSITION = stalker_ids.action_hold_position, // 23
  GET_DISTANCE = stalker_ids.action_get_distance, // 24
  DETOUR_ENEMY = stalker_ids.action_detour_enemy, // 25
  SEARCH_ENEMY = stalker_ids.action_search_enemy, // 26
  // ...
  SUDDEN_ATTACK = stalker_ids.action_sudden_attack, // 28
  KILL_ENEMY_IF_NOT_VISIBLE = stalker_ids.action_kill_enemy_if_not_visible, // 29
  REACH_WOUNDED_ENEMY = stalker_ids.action_reach_wounded_enemy, // 30
  // ...
  PREPARE_WOUNDED_ENEMY = stalker_ids.action_prepare_wounded_enemy, // 32
  KILL_WOUNDED_ENEMY = stalker_ids.action_kill_wounded_enemy, // 33
  POST_COMBAT_WAIT = stalker_ids.action_post_combat_wait, // 34
  KILL_IF_PLAYER_ON_THE_PATH = stalker_ids.action_kill_if_player_on_the_path, // 35
  CRITICALLY_WOUNDED = stalker_ids.action_critically_wounded, // 36
  KILL_IF_ENEMY_CRITICALLY_WOUNDED = stalker_ids.action_kill_if_enemy_critically_wounded, // 37
  // ...
  DANGER_UNKNOWN_SEARCH = stalker_ids.action_danger_unknown_search, // 76
  DANGER_TAKE_COVER = stalker_ids.action_danger_in_direction_take_cover, // 77
  DANGER_LOOK_OUT = stalker_ids.action_danger_in_direction_look_out, // 78
  DANGER_HOLD_POSITION = stalker_ids.action_danger_in_direction_hold_position, // 79
  DANGER_DETOUR = stalker_ids.action_danger_in_direction_detour, // 80
  DANGER_SEARCH = stalker_ids.action_danger_in_direction_search, // 81
  GRENADE_TAKE_COVER = stalker_ids.action_danger_grenade_take_cover, // 82
  GRENADE_WAIT_FOR_EXPLOSION = stalker_ids.action_danger_grenade_wait_for_explosion, // 83
  GRENADE_TAKE_COVER_AFTER_EXPLOSION = stalker_ids.action_danger_grenade_take_cover_after_explosion, // 84
  GRENADE_LOOK_AROUND = stalker_ids.action_danger_grenade_look_around, // 85
  GRENADE_SEARCH = stalker_ids.action_danger_grenade_search, // 86
  DEATH = stalker_ids.action_death_planner, // 87
  ALIFE = stalker_ids.action_alife_planner, // 88
  COMBAT = stalker_ids.action_combat_planner, // 89
  ANOMALY = stalker_ids.action_anomaly_planner, // 90
  DANGER = stalker_ids.action_danger_planner, // 91
  SCRIPT = stalker_ids.action_script, // 92
  /**
   * Custom LUA scripts defined actions:
   */
  // Search corpse action, when searching dead bodies.
  SEARCH_CORPSE = 142, // 142
  // Help heavy wounded action, when HP is low and stalker is laying on the floor.
  HELP_WOUNDED = 147, // 147
  STATE_TO_IDLE_COMBAT = 193, // 193
  STATE_TO_IDLE_ALIFE = 194, // 194
  STATE_TO_IDLE_ITEMS = 195, // 195
  SMART_COVER_ACTIVITY = 307, // 307
  MEET_WAITING_ACTIVITY = 343, // 343
  // Object is staying is smart cover point.
  COVER_ACTIVITY = 393, // 393
  CLOSE_COMBAT = 403, // 403
  ABUSE = 432, // 432
  ANIMPOINT_ACTIVITY = 453, // 453
  ANIMPOINT_REACH = 454, // 454
  PATROL_ACTIVITY = 1336, // 1336
  COMMAND_SQUAD = 1337, // 1337
  BECOME_WOUNDED = 1346, // 1346
  ZOMBIED_SHOOT = 2470, // 2470
  ZOMBIED_GO_TO_DANGER = 2471, // 2471
  SHOOT = 2490, // 2490
  LOOK_AROUND = 2491, // 2491
  SLEEP_ACTIVITY = 3675, // 3675
  WALKER_ACTIVITY = 3865, // 3865
  REMARK_ACTIVITY = 4015, // 4015
  COMPANION_ACTIVITY = 4045, // 4045
}
