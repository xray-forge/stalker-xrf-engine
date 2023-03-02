import { SimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { Stalker } from "@/mod/scripts/core/alife/Stalker";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = SimSquad | SmartTerrain | Stalker;
