import { Actor } from "@/engine/core/objects";
import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/engine/core/objects/alife/Squad";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Actor;
