import {
  action_planner,
  alife,
  cse_alife_creature_abstract,
  danger_object,
  LuabindClass,
  property_evaluator,
  stalker_ids,
  time_global,
} from "xray16";

import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { ISchemeDangerState } from "@/engine/core/schemes/danger";
import { SchemeDanger } from "@/engine/core/schemes/danger/SchemeDanger";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorDanger extends property_evaluator {
  private readonly state: ISchemeDangerState;
  private readonly schemeDanger: typeof SchemeDanger;

  public actionPlanner: Optional<action_planner> = null;

  public constructor(state: ISchemeDangerState, schemeDanger: typeof SchemeDanger) {
    super(null, EvaluatorDanger.__name);
    this.state = state;
    this.schemeDanger = schemeDanger;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    const bestDanger: danger_object = this.object.best_danger() as danger_object;

    if (
      this.state.danger_time !== null &&
      bestDanger !== null &&
      time_global() - this.state.danger_time < logicsConfig.DANGER_INERTION_TIME
    ) {
      return true;
    }

    if (!this.schemeDanger.isObjectFacingDanger(this.object)) {
      return false;
    }

    if (
      this.actionPlanner.initialized() &&
      this.actionPlanner.current_action_id() === stalker_ids.action_danger_planner
    ) {
      if (bestDanger.type() === danger_object.entity_corpse) {
        this.state.danger_time = bestDanger.object().death_time();
      }

      this.state.danger_time = bestDanger.time();
    }

    const serverObject: Optional<cse_alife_creature_abstract> = alife().object(this.object.id());

    if (serverObject && serverObject.m_smart_terrain_id !== MAX_U16) {
      alife().object<SmartTerrain>(serverObject.m_smart_terrain_id)!.startAlarm();
    }

    return true;
  }
}
