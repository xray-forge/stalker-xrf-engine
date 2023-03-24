import { stalker_ids } from "xray16";

import { TNumberId } from "@/engine/lib/types";

/**
 * Base index in game core.
 * 74 by default.
 */
const base: TNumberId = stalker_ids.property_script || 74;

/**
 * todo;
 */
export enum EEvaluatorId {
  BASE = base,
  REACTION = base + 5,
  corpse_exist = base + 50,
  wounded_exist = base + 55,
  state_mgr = base + 100,
  state_mgr_idle_combat = base + 101,
  state_mgr_idle_alife = base + 102,
  state_mgr_idle_smartcover = base + 103,
  state_mgr_logic_active = base + 104,
  state_mgr_idle_items = base + 105,
  smartcover_action = base + 400,
  animpoint_property = base + 500,
  stohe_meet_base = base + 1030,
  stohe_cover_base = base + 1070,
  stohe_camper_base = base + 1080,
  script_combat = base + 1110,
  abuse_base = base + 1120,
  sidor_wounded_base = base + 2010,
  sidor_patrol_base = base + 2250,
  combat_zombied_base = base + 3110,
  combat_camper_base = base + 3130,
  zmey_sleeper_base = base + 4190,
  zmey_walker_base = base + 4370,
  zmey_remark_base = base + 4520,
  zmey_companion_base = base + 4550,
}
