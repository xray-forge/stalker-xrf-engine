import { ini_file } from "xray16";

import { IReleaseDescriptor } from "@/engine/core/managers/death/death_types";
import { readIniNumber } from "@/engine/core/utils/ini";
import { IniFile, TIndex } from "@/engine/lib/types";

const RELEASE_BODY_MANAGER_LTX: IniFile = new ini_file("managers\\release_body_manager.ltx");

export const deathConfig = {
  MIN_DISTANCE_SQR: Math.pow(readIniNumber(RELEASE_BODY_MANAGER_LTX, "config", "min_distance") ?? 70, 2),
  IDLE_AFTER_DEATH: readIniNumber(RELEASE_BODY_MANAGER_LTX, "config", "idle_after_death") ?? 60_000,
  MAX_BODY_COUNT: readIniNumber(RELEASE_BODY_MANAGER_LTX, "config", "max_body_count") ?? 15,
  // List of objects to release.
  RELEASE_OBJECTS_REGISTRY: new LuaTable<TIndex, IReleaseDescriptor>(),
};
