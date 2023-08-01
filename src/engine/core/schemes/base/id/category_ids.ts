import { stalker_ids } from "xray16";

import { EActionId } from "@/engine/core/schemes/base/id/action_ids";
import { TNumberId } from "@/engine/lib/types";

/**
 * Map of actions linked to combat.
 */
export const COMBAT_ACTION_IDS: Record<TNumberId, boolean> = {
  [stalker_ids.action_combat_planner]: true,
  [stalker_ids.action_danger_planner]: true,
  [stalker_ids.action_anomaly_planner]: true,
};

/**
 * Map of actions linked to idle alife.
 */
export const NO_IDLE_ALIFE_IDS: Record<TNumberId, boolean> = {
  [EActionId.MEET_WAITING_ACTIVITY]: true,
};
