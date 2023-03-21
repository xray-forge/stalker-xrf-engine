import {
  alife,
  LuabindClass,
  property_evaluator,
  stalker_ids,
  time_global,
  XR_action_planner,
  XR_cse_alife_creature_abstract,
} from "xray16";

import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
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
  public manager: Optional<XR_action_planner> = null;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeDangerState, schemeDanger: typeof SchemeDanger) {
    super(null, EvaluatorDanger.__name);
    this.state = state;
    this.schemeDanger = schemeDanger;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (this.manager === null) {
      this.manager = this.object.motivation_action_manager();
    }

    if (
      this.state.danger_time !== null &&
      this.object.best_danger() !== null &&
      time_global() - this.state.danger_time < logicsConfig.DANGER_INERTION_TIME
    ) {
      return true;
    }

    if (!this.schemeDanger.isDangerObject(this.object)) {
      return false;
    }

    if (this.manager.initialized() && this.manager.current_action_id() === stalker_ids.action_danger_planner) {
      this.state.danger_time = this.schemeDanger.get_danger_time(this.object.best_danger()!);
    }

    const serverObject = alife().object<XR_cse_alife_creature_abstract>(this.object.id());

    if (serverObject && serverObject.m_smart_terrain_id !== MAX_U16) {
      alife().object<SmartTerrain>(serverObject.m_smart_terrain_id)!.set_alarm();
    }

    return true;
  }
}
