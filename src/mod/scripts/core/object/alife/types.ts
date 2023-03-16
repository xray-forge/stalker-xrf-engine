import { SmartTerrain } from "@/mod/scripts/core/object/alife/smart/SmartTerrain";
import { Squad } from "@/mod/scripts/core/object/alife/Squad";
import { Stalker } from "@/mod/scripts/core/object/alife/Stalker";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Stalker;
