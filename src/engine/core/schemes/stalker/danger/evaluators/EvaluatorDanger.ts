import { LuabindClass, property_evaluator, time_global } from "xray16";

import { EActionId } from "@/engine/core/ai/planner/types";
import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger";
import { dangerConfig } from "@/engine/core/schemes/stalker/danger/DangerConfig";
import { isObjectFacingDanger } from "@/engine/core/schemes/stalker/danger/utils";
import { startSmartTerrainAlarm } from "@/engine/core/utils/smart_terrain";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { ActionPlanner, DangerObject, GameObject, Optional, ServerCreatureObject } from "@/engine/lib/types";

/**
 * Evaluator to check whether any danger is active.
 */
@LuabindClass()
export class EvaluatorDanger extends property_evaluator {
  private readonly state: ISchemeDangerState;

  public planner: Optional<ActionPlanner> = null;

  public constructor(state: ISchemeDangerState) {
    super(null, EvaluatorDanger.__name);
    this.state = state;
  }

  public override evaluate(): boolean {
    const object: GameObject = this.object;

    if (!this.planner) {
      this.planner = object.motivation_action_manager();
    }

    if (isObjectFacingDanger(object)) {
      // For corpses should be: bestDanger.type() === danger_object.entity_corpse -> bestDanger.object().death_time()
      if (this.planner.initialized() && this.planner.current_action_id() === EActionId.DANGER) {
        this.state.dangerTime = (object.best_danger() as DangerObject).time();
      }

      const serverObject: Optional<ServerCreatureObject> = registry.simulator.object(object.id());

      if (serverObject && serverObject.m_smart_terrain_id !== MAX_ALIFE_ID) {
        startSmartTerrainAlarm(
          registry.simulator.object<SmartTerrain>(serverObject.m_smart_terrain_id) as SmartTerrain
        );
      }

      return true;
    } else {
      return (
        object.best_danger() !== null &&
        this.state.dangerTime !== null &&
        time_global() - this.state.dangerTime < dangerConfig.INERTIA_TIME
      );
    }
  }
}
