import { LuabindClass, property_evaluator, time_global } from "xray16";
import { ActionPlanner, DangerObject, GameObject, ServerCreatureObject } from "xray16/alias";
import { MAX_ALIFE_ID, Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { EActionId } from "@/engine/core/ai/planner/types";
import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger";
import { dangerConfig } from "@/engine/core/schemes/stalker/danger/DangerConfig";
import { isObjectFacingDanger } from "@/engine/core/schemes/stalker/danger/utils";
import { startTerrainAlarm } from "@/engine/core/utils/smart_terrain";

/**
 * Evaluator to check whether any danger is active.
 */
@LuabindClass()
export class EvaluatorDanger extends property_evaluator {
  private readonly state: ISchemeDangerState;

  public planner: Nillable<ActionPlanner> = null;

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

      const serverObject: Nillable<ServerCreatureObject> = registry.simulator.object(object.id());

      if (serverObject && serverObject.m_smart_terrain_id !== MAX_ALIFE_ID) {
        startTerrainAlarm(registry.simulator.object<SmartTerrain>(serverObject.m_smart_terrain_id) as SmartTerrain);
      }

      return true;
    } else {
      return (
        $isNotNil(object.best_danger()) &&
        $isNotNil(this.state.dangerTime) &&
        time_global() - this.state.dangerTime < dangerConfig.INERTIA_TIME
      );
    }
  }
}
