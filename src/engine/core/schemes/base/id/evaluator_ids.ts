import { stalker_ids } from "xray16";

import { TNumberId } from "@/engine/lib/types";

/**
 * Base index in game core.
 * 74 by default.
 */
const BASE: TNumberId = stalker_ids.property_script || 74;

/**
 * todo;
 */
export enum EEvaluatorId {
  // Whether any corpse to loot exists nearby.
  IS_CORPSE_EXISTING = BASE + 50, // 124
  // Whether any wounded stalker to help exists nearby.
  IS_WOUNDED_EXISTING = BASE + 55, // 129
  IS_STATE_IDLE_COMBAT = BASE + 101, // 175
  IS_STATE_IDLE_ALIFE = BASE + 102, // 176
  IS_STATE_LOGIC_ACTIVE = BASE + 104, // 178
  IS_STATE_IDLE_ITEMS = BASE + 105, // 179
  IS_SMART_COVER_NEEDED = BASE + 401, // 475
  CAN_USE_SMART_COVER_IN_COMBAT = BASE + 402, // 476
  IS_ANIMPOINT_NEEDED = BASE + 501, // 575
  IS_ANIMPOINT_REACHED = BASE + 502, // 576
  IS_MEET_CONTACT = BASE + 1031, // 1105
  NEED_COVER = BASE + 1071, // 1145
  IS_CAMPING_ENDED = BASE + 1081, // 1155
  IS_CLOSE_COMBAT = BASE + 1082, // 1156
  IS_SCRIPTED_COMBAT = BASE + 1110, // 1184
  IS_ABUSED = BASE + 1120, // 1194
  IS_WOUNDED = BASE + 2010, // 2084
  CAN_FIGHT = BASE + 2011, // 2085
  IS_PATROL_ENDED = BASE + 2250, // 2324
  IS_PATROL_COMMANDER = BASE + 2251, // 2325
  IS_COMBAT_ZOMBIED_ENABLED = BASE + 3110, // 3184
  IS_COMBAT_CAMPING_ENABLED = BASE + 3130, // 3204
  SEE_ENEMY = BASE + 3131, // 3205
  NEED_SLEEPER = BASE + 4191, // 4265
  NEED_WALKER = BASE + 4371, // 4445
  NEED_REMARK = BASE + 4521, // 4595
  NEED_COMPANION = BASE + 4551, // 4625
}
