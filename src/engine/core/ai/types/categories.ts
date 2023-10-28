import { EActionId } from "@/engine/core/ai/types/motivator_actions";
import { TNumberId } from "@/engine/lib/types";

/**
 * Map of actions linked to combat.
 */
export const COMBAT_ACTION_IDS: Record<TNumberId, boolean> = {
  [EActionId.COMBAT]: true,
  [EActionId.DANGER]: true,
  [EActionId.ANOMALY]: true,
};

/**
 * Map of actions linked to idle alife.
 */
export const NO_IDLE_ALIFE_IDS: Record<TNumberId, boolean> = {
  [EActionId.MEET_WAITING_ACTIVITY]: true,
};
