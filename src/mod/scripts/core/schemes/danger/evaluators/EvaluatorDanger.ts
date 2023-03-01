import {
  alife,
  property_evaluator,
  stalker_ids,
  time_global,
  XR_action_planner,
  XR_cse_alife_creature_abstract,
} from "xray16";

import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { logicsConfig } from "@/mod/lib/configs/LogicsConfig";
import { Optional } from "@/mod/lib/types";
import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { SchemeDanger } from "@/mod/scripts/core/schemes/danger/SchemeDanger";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorDanger extends property_evaluator {
  private readonly state: IStoredObject;
  private readonly schemeDanger: typeof SchemeDanger;
  public manager: Optional<XR_action_planner> = null;

  public constructor(state: IStoredObject, schemeDanger: typeof SchemeDanger) {
    super(null, EvaluatorDanger.__name);
    this.state = state;
    this.schemeDanger = schemeDanger;
  }

  public evaluate(): boolean {
    if (this.manager === null) {
      this.manager = this.object.motivation_action_manager();
    }

    if (
      this.state.danger_time !== null &&
      this.object.best_danger() !== null &&
      time_global() - this.state.danger_time < logicsConfig.DANGER_INERTION_TIME
    ) {
      registry.objects.get(this.object.id()).danger_flag = true;

      return true;
    }

    if (!this.schemeDanger.is_danger(this.object)) {
      registry.objects.get(this.object.id()).danger_flag = false;

      return false;
    }

    if (this.manager.initialized() && this.manager.current_action_id() === stalker_ids.action_danger_planner) {
      this.state.danger_time = this.schemeDanger.get_danger_time(this.object.best_danger()!);
    }

    registry.objects.get(this.object.id()).danger_flag = true;

    const se_obj = alife().object<XR_cse_alife_creature_abstract>(this.object.id());

    if (se_obj && se_obj.m_smart_terrain_id !== MAX_UNSIGNED_16_BIT) {
      alife().object<SmartTerrain>(se_obj.m_smart_terrain_id)!.set_alarm();
    }

    return true;
  }
}
