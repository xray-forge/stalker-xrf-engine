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
  ALIFE = stalker_ids.action_alife_planner,
  SEARCH_CORPSE = BASE + 50,
  HELP_WOUNDED = BASE + 55,
  STATE_TO_IDLE_COMBAT = BASE + 101,
  STATE_TO_IDLE_ALIFE = BASE + 102,
  STATE_TO_IDLE_ITEMS = BASE + 103,
  SMART_COVER_ACTIVITY = BASE + 215,
  MEET_WAITING_ACTIVITY = BASE + 251,
  COVER_ACTIVITY = BASE + 301,
  CAMP_PATROL = BASE + 311,
  ABUSE = BASE + 340,
  ANIMPOINT_ACTIVITY = BASE + 361,
  ANIMPOINT_REACH = BASE + 362,
  PATROL_ACTIVITY = BASE + 1244,
  COMMAND_SQUAD = BASE + 1245,
  BECOME_WOUNDED = BASE + 1254,
  ZOMBIED_SHOOT = BASE + 2378,
  ZOMBIED_GO_TO_DANGER = BASE + 2379,
  SHOOT = BASE + 2398,
  LOOK_AROUND = BASE + 2399,
  SLEEP_ACTIVITY = BASE + 3583,
  WALKER_ACTIVITY = BASE + 3773,
  REMARK_ACTIVITY = BASE + 3923,
  COMPANION_ACTIVITY = BASE + 3953,
}
