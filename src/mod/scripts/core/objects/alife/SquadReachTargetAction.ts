import { alife, XR_CTime } from "xray16";

import { Optional } from "@/mod/lib/types";
import { getSimulationObjectsRegistry } from "@/mod/scripts/core/database/SimulationObjectsRegistry";
import type { Squad } from "@/mod/scripts/core/objects/alife/Squad";

/**
 * todo;
 */
export class SquadReachTargetAction {
  public readonly name: string = "reach_target";
  public board: any;
  public squad_id: number;
  public start_time: Optional<XR_CTime> = null;
  public idle_time!: number;

  /**
   * todo;
   */
  public constructor(squad: Squad) {
    this.board = squad.board;
    this.squad_id = squad.id;
  }

  /**
   * todo;
   */
  public finalize(): void {}

  /**
   * todo;
   */
  public update(isUnderSimulation: boolean): boolean {
    const squad = alife().object<Squad>(this.squad_id)!;
    let squad_target = getSimulationObjectsRegistry().objects.get(squad.assigned_target_id!);

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

  /**
   * todo;
   */
  public make(isUnderSimulation: boolean): void {
    const squad = alife().object<Squad>(this.squad_id)!;
    let squad_target = getSimulationObjectsRegistry().objects.get(squad.assigned_target_id!);

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
