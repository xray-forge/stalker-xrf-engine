import { cond, move } from "xray16";

import { registry } from "@/engine/core/database";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { ESquadActionType, Squad } from "@/engine/core/objects/squad";
import { scriptCaptureMonster, scriptCommandMonster } from "@/engine/core/utils/scheme";
import { isSquadAction } from "@/engine/core/utils/squad";
import { GameObject, Optional, TNumberId } from "@/engine/lib/types";

/**
 * @param object - game object in squad to update actions for
 * @param squad - squad of the object to update
 */
export function updateMonsterSquadAction(object: GameObject, squad: Squad): void {
  if (isSquadAction(squad, ESquadActionType.REACH_TARGET)) {
    const target: Optional<TSimulationObject> = registry.simulationObjects.get(
      squad.assignedTargetId as TNumberId
    ) as Optional<TSimulationObject>;

    if (target) {
      const commanderId: TNumberId = squad.commander_id();
      const isFarFromCommander: boolean =
        commanderId !== object.id() &&
        registry.simulator.object(commanderId)!.position.distance_to_sqr(object.position()) > 100;

      scriptCaptureMonster(object, true);
      scriptCommandMonster(
        object,
        new move(isFarFromCommander ? move.run_with_leader : move.walk_with_leader, target.position),
        new cond(cond.move_end)
      );
    }
  }
}
