import { SmartTerrain } from "@/mod/scripts/core/objects/alife/SmartTerrain";
import { Squad } from "@/mod/scripts/core/objects/alife/Squad";
import { Stalker } from "@/mod/scripts/core/objects/alife/Stalker";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Stalker;
