import { registry } from "@/engine/core/database";
import { SquadStayOnTargetAction } from "@/engine/core/objects/squad/action";
import { Squad } from "@/engine/core/objects/squad/Squad";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { getSquadMembersRelationToActor } from "@/engine/core/utils/relation";
import { getSquadCommunity } from "@/engine/core/utils/squad";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { AlifeSimulator, TLabel } from "@/engine/lib/types";

/**
 * Get map display hint for debugging and display in game UI map.
 *
 * @param squad - target squad to get hint for
 * @returns hint to show when hovering over in PDA map
 */
export function getSquadMapDisplayHint(squad: Squad): TLabel {
  if (forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
    const simulator: AlifeSimulator = registry.simulator;

    let hint: TLabel = string.format(
      "[%s]\\navailable = %s\\nonline = %s\\nfaction = %s\\ncommunity = %s\\nspawn_id = %s\\nspawn_section = %s\\n",
      squad.name(),
      squad.isSimulationAvailable(),
      squad.online,
      squad.faction,
      getSquadCommunity(squad),
      squad.respawnPointId,
      squad.respawnPointSection
    );

    hint += string.format(
      "[smart_terrain]\\nassigned = %s\\nentered = %s\\n",
      squad.assignedSmartTerrainId && simulator.object(squad.assignedSmartTerrainId)?.name(),
      squad.enteredSmartTerrainId && simulator.object(squad.enteredSmartTerrainId)?.name()
    );

    hint += string.format(
      "[target]\\ncurrent = %s\\nassigned = %s\\nlast = %s\\nnext = %s\\n",
      squad.currentTargetId && simulator.object(squad.currentTargetId)?.name(),
      squad.assignedTargetId && simulator.object(squad.assignedTargetId)?.name(),
      squad.lastTarget,
      squad.nextTargetIndex
    );

    hint += string.format("[action]\\ncurrent = %s\\n", squad.currentAction?.type);

    if (squad.currentAction?.type === ESquadActionType.STAY_ON_TARGET) {
      hint += string.format(
        "stay_on_target_for = %s\\n",
        (squad.currentAction as SquadStayOnTargetAction).getStayIdleDuration()
      );
    }

    hint += string.format(
      "[relation]\\nsympathy = %s\\nrelationship = %s\\n",
      squad.sympathy,
      getSquadMembersRelationToActor(squad)
    );

    return hint;
  } else {
    return "";
  }
}
