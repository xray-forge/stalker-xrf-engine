import { IReleaseDescriptor } from "@/engine/core/managers/death/death_types";
import { TIndex } from "@/engine/lib/types";

export const deathConfig = {
  MAX_DISTANCE_SQR: 4_900, // 70 * 70
  IDLE_AFTER_DEATH: 40_000, // time to ignore clean up
  MAX_BODY_COUNT: 15,
  // List of objects to release.
  RELEASE_OBJECTS_REGISTRY: new LuaTable<TIndex, IReleaseDescriptor>(),
};
