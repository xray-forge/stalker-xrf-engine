import { cond, move } from "xray16";

import { registry } from "@/engine/core/database";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { ESquadActionType, Squad } from "@/engine/core/objects/squad";
import { scriptCaptureMonster, scriptCommandMonster } from "@/engine/core/utils/scheme";
import { isSquadAction } from "@/engine/core/utils/squad";
import { GameObject, Optional, TNumberId, Vector } from "@/engine/lib/types";

/**
 * @param object - target game object in squad to update actions for
 * @param squad - squad of the object to update
 */
export function updateMonsterSquadAction(object: GameObject, squad: Squad): void {
  if (isSquadAction(squad, ESquadActionType.REACH_TARGET)) {
    const isSquadCommander: boolean = squad?.commander_id() === object.id();
    const currentTarget: Optional<TSimulationObject> = registry.simulationObjects.get(
      squad.assignedTargetId as TNumberId
    ) as Optional<TSimulationObject>;

    if (currentTarget) {
      scriptCaptureMonster(object, true);

      if (isSquadCommander) {
        scriptCommandMonster(object, new move(move.walk_with_leader, currentTarget.position), new cond(cond.move_end));
      } else {
        const commanderPosition: Vector = registry.simulator.object(squad.commander_id())!.position;

        if (commanderPosition.distance_to_sqr(object.position()) > 100) {
          scriptCommandMonster(object, new move(move.run_with_leader, currentTarget.position), new cond(cond.move_end));
        } else {
          scriptCommandMonster(
            object,
            new move(move.walk_with_leader, currentTarget.position),
            new cond(cond.move_end)
          );
        }
      }
    }
  }
}
