import { registry } from "@/engine/core/database";
import type { TSimulationObject } from "@/engine/core/managers/simulation/types";
import { setupSimulationObjectSquadAndGroup } from "@/engine/core/managers/simulation/utils/simulation_squads";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { ESquadActionType, ISquadAction } from "@/engine/core/objects/squad/squad_types";
import { Optional, TNumberId } from "@/engine/lib/types";

/**
 * Implement movement to target action.
 * Once activated, squad will try to follow/reach terrain or another squad.
 */
export class SquadReachTargetAction implements ISquadAction {
  public readonly type: ESquadActionType = ESquadActionType.REACH_TARGET;
  public readonly squad: Squad;

  public constructor(squad: Squad) {
    this.squad = squad;
  }

  /**
   * Start reaching target, initialize action.
   * todo: Clarify simulation flag.
   *
   * @param isUnderSimulation - whether squad initializing new action is under simulation
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
   * todo: Clarify simulation flag.
   *
   * @param isUnderSimulation - whether squad initializing new action is under simulation
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
