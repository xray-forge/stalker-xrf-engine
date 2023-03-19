import { alife, XR_CTime } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import type { Squad } from "@/engine/core/objects/alife/Squad";
import { TSimulationObject } from "@/engine/core/objects/alife/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SquadReachTargetAction {
  public readonly name: string = "reach_target";

  public simulationBoardManager: SimulationBoardManager;
  public squadId: TNumberId;

  public actionStartTime: Optional<XR_CTime> = null;
  public actionIdleTime!: number;

  /**
   * todo;
   */
  public constructor(squad: Squad) {
    this.simulationBoardManager = squad.simulationBoardManager;
    this.squadId = squad.id;
  }

  /**
   * todo;
   */
  public finalize(): void {}

  /**
   * todo;
   */
  public update(isUnderSimulation: boolean): boolean {
    const squad = alife().object<Squad>(this.squadId)!;
    let squadTarget: Optional<TSimulationObject> = registry.simulationObjects.get(squad.assigned_target_id!);

    if (!isUnderSimulation) {
      squadTarget = alife().object(squad.assigned_target_id!)!;
    }

    if (squadTarget === null) {
      squad.clear_assigned_target();

      return true;
    }

    if (squadTarget.am_i_reached(squad)) {
      squadTarget.on_after_reach(squad);

      return true;
    }

    return false;
  }

  /**
   * todo;
   */
  public make(isUnderSimulation: boolean): void {
    const squad: Squad = alife().object<Squad>(this.squadId) as Squad;
    let squadTarget: Optional<TSimulationObject> = registry.simulationObjects.get(squad.assigned_target_id!);

    if (!isUnderSimulation) {
      squadTarget = alife().object(squad.assigned_target_id!)!;
    }

    if (squadTarget !== null) {
      squadTarget.on_reach_target(squad);
    }

    for (const squadMember of squad.squad_members()) {
      if (squadMember.object !== null) {
        this.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
      }
    }
  }
}
