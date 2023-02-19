import { alife, property_evaluator, XR_property_evaluator } from "xray16";

import type { IActor } from "@/mod/scripts/core/alife/Actor";
import type { ISimSquad } from "@/mod/scripts/core/alife/SimSquad";
import type { ISmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { getObjectSquad } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorReachedTaskLocation");

export interface IEvaluatorReachedTaskLocation extends XR_property_evaluator {}

export const EvaluatorReachedTaskLocation: IEvaluatorReachedTaskLocation = declare_xr_class(
  "EvaluatorReachedTaskLocation",
  property_evaluator,
  {
    __init(name: string): void {
      property_evaluator.__init(this, null, name);
    },
    evaluate(): boolean {
      const squad = getObjectSquad(this.object);

      if (squad && squad.current_action && squad.current_action.name === "reach_target") {
        const squad_target = alife().object<IActor | ISmartTerrain | ISimSquad>(squad.assigned_target_id!);

        if (squad_target === null) {
          return false;
        }

        return !squad_target.am_i_reached(squad);
      }

      return false;
    },
  } as IEvaluatorReachedTaskLocation
);
