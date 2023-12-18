import { LuabindClass, property_evaluator, time_global } from "xray16";

import { EActionId } from "@/engine/core/ai/planner/types";
import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger";
import { dangerConfig } from "@/engine/core/schemes/stalker/danger/DangerConfig";
import { isObjectFacingDanger } from "@/engine/core/schemes/stalker/danger/utils";
import { startSmartTerrainAlarm } from "@/engine/core/utils/smart_terrain";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ActionPlanner, DangerObject, Optional, ServerCreatureObject } from "@/engine/lib/types";

/**
 * Evaluator to check whether any danger is active.
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

    if (isObjectFacingDanger(this.object)) {
      // For corpses should be: bestDanger.type() === danger_object.entity_corpse -> bestDanger.object().death_time()
      if (this.actionPlanner.initialized() && this.actionPlanner.current_action_id() === EActionId.DANGER) {
        this.state.dangerTime = bestDanger.time();
      }

      const serverObject: Optional<ServerCreatureObject> = registry.simulator.object(this.object.id());

      if (serverObject && serverObject.m_smart_terrain_id !== MAX_U16) {
        startSmartTerrainAlarm(
          registry.simulator.object<SmartTerrain>(serverObject.m_smart_terrain_id) as SmartTerrain
        );
      }

      return true;
    } else {
      // Handle checking after danger fading.
      if (
        bestDanger !== null &&
        this.state.dangerTime !== null &&
        time_global() - this.state.dangerTime < dangerConfig.INERTIA_TIME
      ) {
        return true;
      }

      return false;
    }
  }
}
