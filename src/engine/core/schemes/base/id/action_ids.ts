import { stalker_ids } from "xray16";

/**
 * Base index in game core.
 * 92 by default.
 */
const base: number = stalker_ids.action_script || 92;

const stohe_actions: number = base + 220;
const sidor_actions: number = stohe_actions + 1024;
const chugai_actions: number = sidor_actions + 1024;
const zmey_actions: number = chugai_actions + 1024;

/**
 * todo;
 * todo: Use ID generator.
 */
export enum EActionId {
  BASE = base,
  alife = stalker_ids.action_alife_planner,
  corpse_exist = base + 50,
  wounded_exist = base + 55,
  state_mgr = base + 100,
  state_mgr_to_idle_combat = base + 101,
  state_mgr_to_idle_alife = base + 102,
  state_mgr_to_idle_items = base + 103,
  smartcover_action = base + 215,
  stohe_meet_base = stohe_actions + 30,
  stohe_cover_base = stohe_actions + 80,
  stohe_camper_base = stohe_actions + 90,
  abuse_base = stohe_actions + 120,
  animpoint_action = stohe_actions + 140,
  sidor_act_patrol = sidor_actions,
  sidor_act_wounded_base = sidor_actions + 10,
  combat_zombied_base = chugai_actions + 110,
  combat_camper_base = chugai_actions + 130,
  zmey_sleeper_base = zmey_actions + 290,
  zmey_walker_base = zmey_actions + 480,
  zmey_remark_base = zmey_actions + 630,
  zmey_companion_base = zmey_actions + 660,
}
