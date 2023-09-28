import { ini_file } from "xray16";

import { readIniTravelDialogs } from "@/engine/core/managers/travel/utils";
import { readIniNumber, readIniStringMap } from "@/engine/core/utils/ini";
import { IniFile } from "@/engine/lib/types";

export const TRAVEL_CONFIG_LTX: IniFile = new ini_file("managers\\travel_manager.ltx");
const [DESCRIPTORS_BY_NAME, DESCRIPTORS_BY_PHRASE] = readIniTravelDialogs(TRAVEL_CONFIG_LTX);

export const travelConfig = {
  // Distance considered too close to travel with group of stalkers.
  TRAVEL_DISTANCE_MIN_THRESHOLD: readIniNumber(TRAVEL_CONFIG_LTX, "config", "travel_distance_min_threshold", false, 50),
  // Duration to delay UI visibility after fast travel.
  TRAVEL_TELEPORT_DELAY: readIniNumber(TRAVEL_CONFIG_LTX, "config", "travel_teleport_delay", false, 3_000),
  TRAVEL_RESOLVE_DELAY: readIniNumber(TRAVEL_CONFIG_LTX, "config", "travel_resolve_delay", false, 6_000),
  // List of travel paths / dialogs.
  TRAVEL_LOCATIONS: readIniStringMap(TRAVEL_CONFIG_LTX, "locations"),
  TRAVEL_DESCRIPTORS_BY_NAME: DESCRIPTORS_BY_NAME,
  TRAVEL_DESCRIPTORS_BY_PHRASE: DESCRIPTORS_BY_PHRASE,
};
