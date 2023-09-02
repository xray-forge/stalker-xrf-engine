import { alife } from "xray16";

import { registry } from "@/engine/core/database";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import type { ISquadAction } from "@/engine/core/objects/server/squad/squad_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Implement movement to target action.
 */
export class SquadReachTargetAction implements ISquadAction {
  public static readonly ACTION_NAME: TName = "reach_target";

  public readonly name: TName = SquadReachTargetAction.ACTION_NAME;
  public readonly squad: Squad;

  public constructor(squad: Squad) {
    this.squad = squad;
  }

  /**
   * Start reaching target, initialize action.
   */
  public initialize(isUnderSimulation: boolean): void {
    const target: Optional<TSimulationObject> = isUnderSimulation
      ? registry.simulationObjects.get(this.squad.assignedTargetId!)
      : alife().object(this.squad.assignedTargetId!);

    if (target !== null) {
      target.onStartedBeingReachedBySquad(this.squad);
    }

    for (const squadMember of this.squad.squad_members()) {
      this.squad.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
    }
  }

  /**
   * Generic cleanup method.
   */
  public finalize(): void {}

  /**
   * Generic update tick.
   */
  public update(isUnderSimulation: boolean): boolean {
    /**
     * Rely on simulation board manager for offline mode.
     */
    const squadTarget: Optional<TSimulationObject> = isUnderSimulation
      ? registry.simulationObjects.get(this.squad.assignedTargetId!)
      : alife().object(this.squad.assignedTargetId!);

    /**
     * Target object stopped existing.
     */
    if (squadTarget === null) {
      this.squad.clearAssignedTarget();

      return true;
    }

    /**
     * Check whether reached and notify end target.
     */
    if (squadTarget.isReachedBySquad(this.squad)) {
      squadTarget.onEndedBeingReachedBySquad(this.squad);

      return true;
    } else {
      return false;
    }
  }
}
