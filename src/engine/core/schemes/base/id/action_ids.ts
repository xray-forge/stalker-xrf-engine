import { stalker_ids } from "xray16";

import { TNumberId } from "@/engine/lib/types";

/**
 * Base index in game core.
 * 92 by default.
 */
const BASE: TNumberId = stalker_ids.action_script || 92;

/**
 * todo;
 */
export enum EActionId {
  GATHER_ITEMS = stalker_ids.action_gather_items, // 2
  ALIFE = stalker_ids.action_alife_planner, // 88
  COMBAT = stalker_ids.action_combat_planner, // 89
  ANOMALY = stalker_ids.action_anomaly_planner, // 90
  DANGER = stalker_ids.action_danger_planner, // 91
  // Search corpse action, when searching dead bodies.
  SEARCH_CORPSE = BASE + 50, // 142
  // Help heavy wounded action, when HP is low and stalker is laying on the floor.
  HELP_WOUNDED = BASE + 55, // 147
  STATE_TO_IDLE_COMBAT = BASE + 101, // 193
  STATE_TO_IDLE_ALIFE = BASE + 102, // 194
  STATE_TO_IDLE_ITEMS = BASE + 103, // 195
  SMART_COVER_ACTIVITY = BASE + 215, // 307
  MEET_WAITING_ACTIVITY = BASE + 251, // 343
  // Object is staying is smart cover point.
  COVER_ACTIVITY = BASE + 301, // 393
  CAMP_PATROL = BASE + 311, // 403
  ABUSE = BASE + 340, // 432
  ANIMPOINT_ACTIVITY = BASE + 361, // 453
  ANIMPOINT_REACH = BASE + 362, // 454
  PATROL_ACTIVITY = BASE + 1244, // 1336
  COMMAND_SQUAD = BASE + 1245, // 1337
  BECOME_WOUNDED = BASE + 1254, // 1346
  ZOMBIED_SHOOT = BASE + 2378, // 2470
  ZOMBIED_GO_TO_DANGER = BASE + 2379, // 2471
  SHOOT = BASE + 2398, // 2490
  LOOK_AROUND = BASE + 2399, // 2491
  SLEEP_ACTIVITY = BASE + 3583, // 3675
  WALKER_ACTIVITY = BASE + 3773, // 3865
  REMARK_ACTIVITY = BASE + 3923, // 4015
  COMPANION_ACTIVITY = BASE + 3953, // 4045
}
