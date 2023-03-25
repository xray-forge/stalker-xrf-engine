import { alife, XR_CTime } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import type { Squad } from "@/engine/core/objects/alife/squad/Squad";
import { TSimulationObject } from "@/engine/core/objects/alife/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TDuration, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SquadReachTargetAction {
  public readonly name: TName = "reach_target";

  public simulationBoardManager: SimulationBoardManager;
  public squadId: TNumberId;

  public actionStartTime: Optional<XR_CTime> = null;
  public actionIdleTime!: TDuration;

  /**
   * todo: Description.
   */
  public constructor(squad: Squad) {
    this.simulationBoardManager = squad.simulationBoardManager;
    this.squadId = squad.id;
  }

  /**
   * todo: Description.
   */
  public finalize(): void {}

  /**
   * todo: Description.
   */
  public update(isUnderSimulation: boolean): boolean {
    const squad: Squad = alife().object<Squad>(this.squadId)!;
    let squadTarget: Optional<TSimulationObject> = registry.simulationObjects.get(squad.assignedTargetId!);

    if (!isUnderSimulation) {
      squadTarget = alife().object(squad.assignedTargetId!)!;
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
   * todo: Description.
   */
  public make(isUnderSimulation: boolean): void {
    const squad: Squad = alife().object<Squad>(this.squadId) as Squad;
    const target: Optional<TSimulationObject> = isUnderSimulation
      ? registry.simulationObjects.get(squad.assignedTargetId!)
      : alife().object(squad.assignedTargetId!);

    if (target !== null) {
      target.on_reach_target(squad);
    }

    for (const squadMember of squad.squad_members()) {
      this.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
    }
  }
}
