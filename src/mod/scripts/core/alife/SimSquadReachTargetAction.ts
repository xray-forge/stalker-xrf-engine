import { alife, XR_CTime } from "xray16";

import { Optional } from "@/mod/lib/types";
import type { SimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { get_sim_obj_registry } from "@/mod/scripts/core/database/SimObjectsRegistry";

/**
 * todo;
 */
export class SimSquadReachTargetAction {
  public readonly name: string = "reach_target";
  public board: any;
  public squad_id: number;
  public start_time: Optional<XR_CTime> = null;
  public idle_time!: number;

  public constructor(squad: SimSquad) {
    this.board = squad.board;
    this.squad_id = squad.id;
  }

  public finalize(): void {}

  public update(isUnderSimulation: boolean): boolean {
    const squad = alife().object<SimSquad>(this.squad_id)!;
    let squad_target = get_sim_obj_registry().objects.get(squad.assigned_target_id!);

    if (!isUnderSimulation) {
      squad_target = alife().object(squad.assigned_target_id!)!;
    }

    if (squad_target === null) {
      squad.clear_assigned_target();

      return true;
    }

    if (squad_target.am_i_reached(squad)) {
      squad_target.on_after_reach(squad);

      return true;
    }

    return false;
  }

  public make(isUnderSimulation: boolean): void {
    const squad = alife().object<SimSquad>(this.squad_id)!;
    let squad_target = get_sim_obj_registry().objects.get(squad.assigned_target_id!);

    if (!isUnderSimulation) {
      squad_target = alife().object(squad.assigned_target_id!)!;
    }

    if (squad_target !== null) {
      squad_target.on_reach_target(squad);
    }

    for (const k of squad.squad_members()) {
      if (k.object !== null) {
        this.board.setup_squad_and_group(k.object);
      }
    }
  }
}
