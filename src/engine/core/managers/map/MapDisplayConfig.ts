import { ini_file } from "xray16";

import {
  readIniMapMarks,
  readIniMapScannerSpots,
  readIniMapSpots,
  readIniSleepSpots,
} from "@/engine/core/managers/map/utils/map_init";
import { readIniBoolean, readIniNumber } from "@/engine/core/utils/ini";
import { IniFile } from "@/engine/lib/types";

export const MAP_DISPLAY_CONFIG_LTX: IniFile = new ini_file("managers\\map_display_manager.ltx");

export const mapDisplayConfig = {
  REQUIRE_SMART_TERRAIN_VISIT: readIniBoolean(MAP_DISPLAY_CONFIG_LTX, "config", "require_smart_terrain_visit", true),
  DISTANCE_TO_OPEN: readIniNumber(MAP_DISPLAY_CONFIG_LTX, "config", "distance_to_open", true),
  DISTANCE_TO_DISPLAY: readIniNumber(MAP_DISPLAY_CONFIG_LTX, "config", "distance_to_display", true),
  DISPLAY_UPDATE_THROTTLE: readIniNumber(MAP_DISPLAY_CONFIG_LTX, "config", "display_update_throttle", true),
  MAP_MARKS: readIniMapMarks(MAP_DISPLAY_CONFIG_LTX),
  MAP_SPOTS: readIniMapSpots(MAP_DISPLAY_CONFIG_LTX),
  SLEEP_SPOTS: readIniSleepSpots(MAP_DISPLAY_CONFIG_LTX),
  SCANNER_SPOTS: readIniMapScannerSpots(MAP_DISPLAY_CONFIG_LTX),
};
