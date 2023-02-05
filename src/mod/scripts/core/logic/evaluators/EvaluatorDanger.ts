import {
  alife,
  property_evaluator,
  stalker_ids,
  time_global,
  XR_action_planner,
  XR_cse_alife_creature_abstract,
  XR_game_object,
  XR_property_evaluator,
} from "xray16";

import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { logicsConfig } from "@/mod/lib/configs/LogicsConfig";
import { Optional } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { ActionDanger } from "@/mod/scripts/core/logic/ActionDanger";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";

export interface IEvaluatorDanger extends XR_property_evaluator {
  state: IStoredObject;
  manager: Optional<XR_action_planner>;
}

export const EvaluatorDanger: IEvaluatorDanger = declare_xr_class("DangerEvaluator", property_evaluator, {
  __init(npc: XR_game_object, name: string, storage: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    if (this.manager === null) {
      this.manager = this.object.motivation_action_manager();
    }

    if (
      this.state.danger_time !== null &&
      this.object.best_danger() !== null &&
      time_global() - this.state.danger_time < logicsConfig.DANGER_INERTION_TIME
    ) {
      storage.get(this.object.id()).danger_flag = true;

      return true;
    }

    if (!ActionDanger.is_danger(this.object)) {
      storage.get(this.object.id()).danger_flag = false;

      return false;
    }

    if (this.manager.initialized() && this.manager.current_action_id() === stalker_ids.action_danger_planner) {
      this.state.danger_time = ActionDanger.get_danger_time(this.object.best_danger()!);
    }

    storage.get(this.object.id()).danger_flag = true;

    const se_obj = alife().object<XR_cse_alife_creature_abstract>(this.object.id());

    if (se_obj && se_obj.m_smart_terrain_id !== MAX_UNSIGNED_16_BIT) {
      alife().object<ISmartTerrain>(se_obj.m_smart_terrain_id)!.set_alarm();
    }

    return true;
  },
} as IEvaluatorDanger);
