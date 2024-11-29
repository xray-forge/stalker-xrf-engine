import { registry } from "@/engine/core/database";
import type { TSimulationObject } from "@/engine/core/managers/simulation/simulation_types";
import { setupSimulationObjectSquadAndGroup } from "@/engine/core/managers/simulation/utils";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { ESquadActionType, ISquadAction } from "@/engine/core/objects/squad/squad_types";
import { Optional, TNumberId } from "@/engine/lib/types";

/**
 * Implement movement to target action.
 */
export class SquadReachTargetAction implements ISquadAction {
  public readonly type: ESquadActionType = ESquadActionType.REACH_TARGET;
  public readonly squad: Squad; // Squad performing reach target action.

  public constructor(squad: Squad) {
    this.squad = squad;
  }

  /**
   * Start reaching target, initialize action.
   */
  public initialize(isUnderSimulation: boolean): void {
    const target: Optional<TSimulationObject> = isUnderSimulation
      ? registry.simulationObjects.get(this.squad.assignedTargetId!)
      : registry.simulator.object(this.squad.assignedTargetId!);

    if (target) {
      target.onSimulationTargetSelected(this.squad);
    }

    for (const squadMember of this.squad.squad_members()) {
      setupSimulationObjectSquadAndGroup(squadMember.object);
    }
  }

  /**
   * Generic cleanup method.
   */
  public finalize(): void {}

  /**
   * @returns whether task is finished
   */
  public update(isUnderSimulation: boolean): boolean {
    const target: Optional<TSimulationObject> = isUnderSimulation
      ? registry.simulationObjects.get(this.squad.assignedTargetId as TNumberId)
      : registry.simulator.object(this.squad.assignedTargetId as TNumberId);

    if (!target) {
      this.squad.clearAssignedTarget();

      return true;
    }

    if (target.isReachedBySimulationObject(this.squad)) {
      target.onSimulationTargetDeselected(this.squad);

      return true;
    } else {
      return false;
    }
  }
}
