import { SmartTerrain } from "@/engine/scripts/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/engine/scripts/core/objects/alife/Squad";
import { Stalker } from "@/engine/scripts/core/objects/alife/Stalker";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Stalker;
