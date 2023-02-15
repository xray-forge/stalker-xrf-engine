import { ini_file, system_ini, XR_ini_file } from "xray16";

export const SYSTEM_INI: XR_ini_file = system_ini();

export const DUMMY_LTX: XR_ini_file = new ini_file("scripts\\dummy.ltx");
export const SIMULATION_LTX: XR_ini_file = new ini_file("misc\\simulation.ltx");
export const SMART_NAMES_LTX: XR_ini_file = new ini_file("misc\\smart_names.ltx");
