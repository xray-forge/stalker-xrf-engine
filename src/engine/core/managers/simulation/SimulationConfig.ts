import { ini_file } from "xray16";

import { IniFile } from "@/engine/lib/types";

export const SIMULATION_LTX: IniFile = new ini_file("managers\\simulation\\simulation.ltx");
export const SIMULATION_OBJECTS_PROPERTIES_LTX: IniFile = new ini_file(
  "managers\\simulation\\simulation_objects_props.ltx"
);

export const simulationConfig = {};
