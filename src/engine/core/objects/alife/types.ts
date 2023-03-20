import { Actor, SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects";
import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/engine/core/objects/alife/Squad";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Actor;

/**
 * Squad action type.
 */
export type TSquadAction = SquadStayOnTargetAction | SquadReachTargetAction;
