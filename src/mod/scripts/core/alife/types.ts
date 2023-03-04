import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { Squad } from "@/mod/scripts/core/alife/Squad";
import { Stalker } from "@/mod/scripts/core/alife/Stalker";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Stalker;
