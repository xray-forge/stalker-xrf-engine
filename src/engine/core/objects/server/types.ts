import { Actor, SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects";
import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { Squad } from "@/engine/core/objects/server/squad/Squad";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Actor;

/**
 * Squad action type.
 */
export type TSquadAction = SquadStayOnTargetAction | SquadReachTargetAction;
