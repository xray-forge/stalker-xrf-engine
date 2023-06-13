import { alife, danger_object, LuabindClass, property_evaluator, stalker_ids, time_global } from "xray16";

import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { ISchemeDangerState } from "@/engine/core/schemes/danger";
import { isObjectFacingDanger } from "@/engine/core/utils/check/check";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ActionPlanner, DangerObject, Optional, ServerCreatureObject, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorDanger extends property_evaluator {
  private readonly state: ISchemeDangerState;

  public actionPlanner: Optional<ActionPlanner> = null;

  public constructor(state: ISchemeDangerState) {
    super(null, EvaluatorDanger.__name);
    this.state = state;
  }

  /**
   * Check whether object is facing any danger.
   */
  public override evaluate(): boolean {
    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    const bestDanger: DangerObject = this.object.best_danger() as DangerObject;
    const now: TTimestamp = time_global();

    if (
      this.state.dangerTime !== null &&
      bestDanger !== null &&
      now - this.state.dangerTime < logicsConfig.DANGER_INERTION_TIME
    ) {
      return true;
    }

    if (!isObjectFacingDanger(this.object)) {
      return false;
    }

    if (
      this.actionPlanner.initialized() &&
      this.actionPlanner.current_action_id() === stalker_ids.action_danger_planner
    ) {
      if (bestDanger.type() === danger_object.entity_corpse) {
        this.state.dangerTime = bestDanger.object().death_time();
      }

      this.state.dangerTime = bestDanger.time();
    }

    const serverObject: Optional<ServerCreatureObject> = alife().object(this.object.id());

    if (serverObject && serverObject.m_smart_terrain_id !== MAX_U16) {
      alife().object<SmartTerrain>(serverObject.m_smart_terrain_id)!.startAlarm();
    }

    return true;
  }
}
